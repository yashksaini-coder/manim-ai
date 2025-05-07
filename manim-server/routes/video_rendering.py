from flask import Blueprint, jsonify, current_app, request, Response
import subprocess
import os
import re
import json
import sys
import traceback
import shutil
from typing import Union
import uuid
import time
import requests
import boto3
from dotenv import load_dotenv

load_dotenv()

video_rendering_bp = Blueprint("video_rendering", __name__)

# Configuration
USE_LOCAL_STORAGE = os.getenv("USE_LOCAL_STORAGE")
BASE_URL = os.getenv("BASE_URL","http://192.168.1.3:5000/")
DO_SPACES_ACCESS_KEY = os.getenv("DO_SPACES_ACCESS_KEY")
DO_SPACES_ACCESS_SECRET = os.getenv("DO_SPACES_ACCESS_SECRET")
DO_SPACES_REGION = os.getenv("DO_SPACES_REGION", "blr1")
DO_SPACES_BUCKET = os.getenv("DO_SPACES_BUCKET", "manima")
DO_SPACES_ENDPOINT = os.getenv("DO_SPACES_ENDPOINT", "https://manima.blr1.digitaloceanspaces.com")


def upload_to_digital_ocean_storage(file_path: str, video_storage_file_name: str) -> str:
    """
    Uploads the video to DigitalOcean Spaces and returns the public URL.
    """
    client = boto3.client(
        's3',
        region_name=DO_SPACES_REGION,
        endpoint_url=DO_SPACES_ENDPOINT,
        aws_access_key_id=DO_SPACES_ACCESS_KEY,
        aws_secret_access_key=DO_SPACES_ACCESS_SECRET
    )

    # Ensure the file name has .mp4 extension
    if not video_storage_file_name.endswith('.mp4'):
        video_storage_file_name += '.mp4'

    client.upload_file(
        file_path,
        DO_SPACES_BUCKET,
        video_storage_file_name,
        ExtraArgs={'ACL': 'public-read', 'ContentType': 'video/mp4'}
    )

    return f"{DO_SPACES_ENDPOINT}/{DO_SPACES_BUCKET}/{video_storage_file_name}"


def move_to_public_folder(
    file_path: str, video_storage_file_name: str, base_url: Union[str, None] = None
) -> str:
    """
    Moves the video to the public folder and returns the URL.
    """
    public_folder = os.path.join(os.path.dirname(__file__), "public")
    os.makedirs(public_folder, exist_ok=True)

    new_file_name = f"{video_storage_file_name}.mp4"
    new_file_path = os.path.join(public_folder, new_file_name)

    shutil.move(file_path, new_file_path)

    # Use the provided base_url if available, otherwise fall back to BASE_URL
    url_base = base_url if base_url else BASE_URL
    video_url = f"{url_base.rstrip('/')}/public/{new_file_name}"
    return video_url


def get_frame_config(aspect_ratio):
    if aspect_ratio == "16:9":
        return (3840, 2160), 14.22
    elif aspect_ratio == "9:16":
        return (1080, 1920), 8.0
    elif aspect_ratio == "1:1":
        return (1080, 1080), 8.0
    else:
        return (3840, 2160), 14.22


@video_rendering_bp.route("/v1/render/video", methods=["POST"])
def render_video_route():
    """
    Endpoint to render a video using Manim based on user-provided code and parameters.
    """
    code = request.json.get("code")
    file_name = request.json.get("file_name")
    file_class = request.json.get("file_class")
    user_id = request.json.get("user_id") or str(uuid.uuid4())
    project_name = request.json.get("project_name")
    iteration = request.json.get("iteration")
    aspect_ratio = request.json.get("aspect_ratio")
    stream = request.json.get("stream", False)

    video_storage_file_name = f"video-{user_id}-{project_name}-{iteration}"

    if not code:
        return jsonify(error="No code provided"), 400

    # Determine frame size and width based on aspect ratio
    frame_size, frame_width = get_frame_config(aspect_ratio)

    # Modify the Manim script to include configuration settings
    modified_code = f"""
from manim import *
from math import *
config.frame_size = {frame_size}
config.frame_width = {frame_width}

{code}
    """

    # Create a unique file name
    temp_file_name = f"scene_{os.urandom(2).hex()}.py"
    api_dir = os.path.dirname(os.path.dirname(__file__))  # Go up one level from routes
    public_dir = os.path.join(api_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    file_path = os.path.join(public_dir, temp_file_name)

    # Write the code to the file
    with open(file_path, "w") as f:
        f.write(modified_code)

    def render_video():
        process = None
        video_file_path = None
        try:
            command_list = [
                "manim",
                file_path,
                file_class,
                "--format=mp4",
                "--media_dir",
                ".",
                "--custom_folders",
            ]

            process = subprocess.Popen(
                command_list,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.path.dirname(os.path.realpath(__file__)),
                text=True,
                bufsize=1,
            )
            current_animation = -1
            current_percentage = 0
            error_output = []
            in_error = False

            while True:
                output = process.stdout.readline()
                error = process.stderr.readline()

                if output == "" and error == "" and process.poll() is not None:
                    break

                if output:
                    print("STDOUT:", output.strip())
                if error:
                    print("STDERR:", error.strip())
                    error_output.append(error.strip())

                # Check for critical errors
                if "is not in the script" in error:
                    in_error = True
                    continue
                if "Traceback (most recent call last)" in error:
                    in_error = True
                    continue
                if in_error:
                    if error.strip() == "":
                        in_error = False
                        full_error = "\n".join(error_output)
                        yield f'{{"error": {json.dumps(full_error)}}}\n'
                        return
                    continue

                animation_match = re.search(r"Animation (\d+):", error)
                if animation_match:
                    new_animation = int(animation_match.group(1))
                    if new_animation != current_animation:
                        current_animation = new_animation
                        current_percentage = 0
                        yield f'{{"animationIndex": {current_animation}, "percentage": 0}}\n'

                percentage_match = re.search(r"(\d+)%", error)
                if percentage_match:
                    new_percentage = int(percentage_match.group(1))
                    if new_percentage != current_percentage:
                        current_percentage = new_percentage
                        yield f'{{"animationIndex": {current_animation}, "percentage": {current_percentage}}}\n'

            if process.returncode == 0:
                # Try to find the video file
                video_file_path = os.path.join(
                    os.path.dirname(os.path.realpath(__file__)),
                    f"{file_class or 'GenScene'}.mp4"
                )
                if not os.path.exists(video_file_path):
                    video_file_path = os.path.join(
                        os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
                        f"{file_class or 'GenScene'}.mp4"
                    )

                if not os.path.exists(video_file_path):
                    print(f"Video file not found. Files in current directory: {os.listdir(os.path.dirname(video_file_path))}")
                    raise FileNotFoundError(f"Video file not found at {video_file_path}")

                print(f"Files in video file directory: {os.listdir(os.path.dirname(video_file_path))}")

                if USE_LOCAL_STORAGE:
                    base_url = (
                        request.host_url
                        if request and hasattr(request, "host_url")
                        else None
                    )
                    video_url = move_to_public_folder(
                        video_file_path, video_storage_file_name, base_url
                    )
                else:
                    video_url = upload_to_digital_ocean_storage(
                        video_file_path, video_storage_file_name
                    )
                print(f"Video URL: {video_url}")

                if stream:
                    yield f'{{ "video_url": "{video_url}" }}\n'
                    sys.stdout.flush()
                else:
                    yield {
                        "message": "Video generation completed",
                        "video_url": video_url,
                    }
            else:
                full_error = "\n".join(error_output)
                yield f'{{"error": {json.dumps(full_error)}}}\n'

        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            traceback.print_exc()
            print(f"Files in current directory after error: {os.listdir('.')}" )
            yield f'{{"error": "Unexpected error occurred: {str(e)}"}}\n'
        finally:
            # Remove the temporary Python file
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"Removed temporary file: {file_path}")
                if video_file_path and os.path.exists(video_file_path):
                    os.remove(video_file_path)
                    print(f"Removed temporary video file: {video_file_path}")
            except Exception as e:
                print(f"Error removing temporary file {file_path}: {e}")

    if stream:
        return Response(
            render_video(), content_type="text/event-stream", status=207
        )
    else:
        video_url = None
        try:
            for result in render_video():
                print(f"Generated result: {result}")
                if isinstance(result, dict):
                    if "video_url" in result:
                        video_url = result["video_url"]
                    elif "error" in result:
                        raise Exception(result["error"])

            if video_url:
                return (
                    jsonify(
                        {
                            "message": "Video generation completed",
                            "video_url": video_url,
                        }
                    ),
                    200,
                )
            else:
                return (
                    jsonify(
                        {
                            "message": "Video generation completed, but no URL was found"
                        }
                    ),
                    200,
                )
        except StopIteration:
            if video_url:
                return (
                    jsonify(
                        {
                            "message": "Video generation completed",
                            "video_url": video_url,
                        }
                    ),
                    200,
                )
            else:
                return (
                    jsonify(
                        {
                            "message": "Video generation completed, but no URL was found"
                        }
                    ),
                    200,
                )
        except Exception as e:
            print(f"Error in non-streaming mode: {e}")
            return jsonify({"error": str(e)}), 500


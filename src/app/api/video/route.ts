import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export async function POST(request: NextRequest) {
  try {
    const { clerkId, videoUrl, code } = await request.json();
    
    if (!clerkId || !videoUrl || !code) {
      return NextResponse.json(
        { error: "Missing required fields: clerkId, videoUrl, code" },
        { status: 400 }
      );
    }

    const videoId = await convex.mutation(api.videos.createVideo, {
      clerkId,
      videoUrl,
      code,
    });

    return NextResponse.json({ videoId });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { error: "Missing required query param: clerkId" },
        { status: 400 }
      );
    }

    const videos = await convex.query(api.videos.getVideosByClerkId, {
      clerkId,
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.videos.updateVideo, {
      id,
      ...updateData,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
} 
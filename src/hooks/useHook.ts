import axios, { AxiosError } from "axios";
import React from "react";
import { BACKEND_URL } from "../../config";
import { toast } from "sonner";

export const useCodehook = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [videoURL, setVideoURL] = React.useState<string>("");
  const [code, setCode] = React.useState<string>("");

  const fetch = async (prompt: string) => {
    setLoading(true);
    try {
      await axios
        .post(`${BACKEND_URL}/v1/generate/code`, {
          prompt,
        })
        .then(async (cr) => {
          setCode(cr.data.code);
          await axios
            .post(`${BACKEND_URL}/v1/render/video`, {
              code: cr.data.code,
              file_name: "GenScene.py",
              file_class: "GenScene",
              iteration: Math.floor(Math.random() * 1000000),
              project_name: "GenScene",
            })
            .then(async (res) => {
              setVideoURL(res.data.video_url);
              setLoading(false);
            });
        });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.message || "Failed to generate video");
      }
    }
  };

  return {
    fetch,
    loading,
    videoURL,
    code,
  };
};

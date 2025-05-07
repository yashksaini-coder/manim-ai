"use client";

import type React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { LLMResponseLoading } from "./LLMResponseLoading";
import { VideoCard } from "./VideoCard";
import { ChatHeader } from "./ChatHeader";
import { ChatLayoutCard } from "./ChatLayoutCard";
import { ChatHistory } from "./ChatHistory";
import { useCodehook } from "@/hooks/useHook";

type Props = {
  chatId: string;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

const Chatpage = ({ chatId }: Props) => {
  const { fetch, loading, code, videoURL } = useCodehook();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loading) {
      setProgress(0);

      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = prev < 30 ? 10 : prev < 60 ? 5 : prev < 80 ? 2 : 1;
          const newProgress = Math.min(prev + increment, 90);
          return newProgress;
        });
      }, 500);
    } else if (progress > 0 && progress < 100) {
      setProgress(100);

      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, progress]);

  const handleSendPrompt = async (promptValue?: string) => {
    const promptToSend = promptValue;
    if (!promptToSend?.trim()) return;
    fetch(promptToSend);
  };

  const handleChatClick = (promptId: string, promptVideoUrl: string) => {
    setSelectedChatId(promptId);
  };

  return (
    <div className="bg-[#0f0f0f] text-slate-200 flex flex-col h-screen overflow-hidden">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden ">
        <ChatHistory
          prompts={[
            {
              createdAt: Date.now().toString(),
              type: "USER",
              image: "https://avatars.githubusercontent.com/u/137854084?v=4",
              value: "Video generation completed, but no URL was found",
              id: "default-id",
              videoUrl: "https://videos.pexels.com/video-files/4620568/4620568-uhd_2732_1440_25fps.mp4",
            },
          ]}
          id={""}
          onChatSelect={handleChatClick}
          loading={loading}
          onSendPrompt={handleSendPrompt}
        />

        <div className="w-full flex rounded-3xl p-5">
          <div className="w-full flex flex-col bg-neutral-950 relative rounded-3xl py-3">
            <div className="flex-1 overflow-y-auto p-6 ">
              {loading && (
                <div className="flex items-center justify-center ">
                  <LLMResponseLoading />
                </div>
              )}

              <div className="flex items-center justify-center min-h-[400px]">
                {videoURL ? (
                  <VideoCard videoUrl={videoURL} />
                ) : (
                  !loading && (
                    <div>
                      <ChatLayoutCard />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: Can be a better way to do this */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Chatpage;

"use client";

import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Info, ChevronRight, ArrowUp } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";

type Message = {
  id: string;
  role: "USER" | "AI";
  userQuery?: string;
  aiPrompt?: string;
  response: string;
  videoUrl?: string | null;
  createdAt: string;
};

type ChatHistoryProps = {
  messages: Message[];
  onMessageSelect: (messageId: string, videoUrl: string | null) => void;
  selectedMessageId: string | null;
  loading: boolean;
  onSendMessage: (promptValue: string, model?: string | null) => void;
  generating: boolean;
};

export function ChatHistory({
  messages,
  onMessageSelect,
  selectedMessageId,
  loading,
  onSendMessage,
  generating,
}: ChatHistoryProps) {
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isBottom = scrollHeight - scrollTop <= clientHeight + 100;
      setIsAtBottom(isBottom);
    }
  };

  useEffect(() => {
    if (scrollRef.current && isAtBottom) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, isAtBottom]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !generating) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="w-2/3 border-none flex flex-col bg-[#0f0f0f] relative">
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent pointer-events-none z-10" />
      <div className="flex-1 overflow-hidden">
        <ScrollArea
          className="h-full [&_[data-radix-scroll-area-viewport]]:!p-0 [&_[data-radix-scroll-area-thumb]]:bg-slate-700/50 hover:[&_[data-radix-scroll-area-thumb]]:bg-slate-600/50"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div className="p-3">
            {loading ? (
              <div className="animate-fade-in flex items-center justify-center p-6">
                <Loader2 size={24} className="animate-spin text-slate-500" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`group transition-all duration-300 ${
                      selectedMessageId === message.id ? "bg-slate-800/20 rounded-md" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        {message.role === "USER" ? (
                          <Image
                            src={user?.imageUrl || "/user-placeholder.png"}
                            alt="User"
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full">
                            <Image
                              src="/logo.png"
                              alt="AI"
                              width={20}
                              height={20}
                            />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">
                            {new Date(message.createdAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {message.role !== "USER" && message.videoUrl && (
                            <button
                              onClick={() =>
                                onMessageSelect(message.id, message.videoUrl || null)
                              }
                              className={`h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                            >
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                        <div className="prose prose-invert max-w-none">
                          {message.role === "USER" ? (
                            <div className="text-slate-200 text-sm">
                              {message.userQuery || message.response}
                            </div>
                          ) : (
                            <div className="text-slate-300 space-y-4 text-sm">
                              {message.response}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {generating && (
                  <div className="animate-fade-in flex items-center justify-center p-6">
                    <Loader2 size={24} className="animate-spin text-slate-500" />
                  </div>
                )}
              </div>
            ) : !loading && (
              <div className="animate-fade-in flex items-center justify-center flex-col py-12">
                <div className="p-6 text-center">
                  <Info size={24} className="mx-auto mb-3 text-slate-500" />
                  <p className="text-slate-400 text-sm">
                    No chat history yet
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Your conversation history will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        {!isAtBottom && (
          <button
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  top: scrollRef.current.scrollHeight,
                  behavior: "smooth",
                });
              }
            }}
            className="absolute bottom-24 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors shadow-lg"
          >
            <ChevronRight className="h-4 w-4 rotate-90" />
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent pointer-events-none z-10" />
      <p className="text-xs text-gray-500 text-start pl-5 pt-5">*AI-generated animations may vary in quality</p>
      <div
        className={`p-4 py-5 sticky bottom-0 transition-shadow duration-200 shadow-3xl z-20`}
      >
        <div className="flex flex-row gap-2 items-center rounded-xl bg-[#181818] border border-neutral-900 px-3 py-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Manim AI..."
            disabled={generating}
            className="flex-1 bg-transparent border-none text-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500 px-2"
          />
          <Button
            onClick={() => {
              onSendMessage(input);
              setInput("");
            }}
            disabled={generating || !input.trim()}
            size="icon"
            variant="default"
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all duration-200 hover:scale-105 ml-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-1">
                <ArrowUp className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>

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
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
} 
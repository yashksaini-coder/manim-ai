"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatCodeBlock } from "@/components/chat/ChatCodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/chat/VideoCard";
import { Play, RefreshCw } from "lucide-react";
import ChatPageInput from "@/components/chat/chat-page-input";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import { generateAnimation } from "@/lib/services";
import { useSearchParams } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

enum ProcessingStage {
  Idle = "idle",
  GeneratingCode = "generating-code",
  RenderingAnimation = "rendering-animation",
  Complete = "complete",
  Error = "error",
}

export default function MainPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(ProcessingStage.Idle);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [codeContent, setCodeContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<"generating" | "rendering" | "complete" | "error">("generating");
  const [renderProgress, setRenderProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { user, isLoaded: isUserLoaded } = useUser();
  const clerkId = user?.id;

  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const cleanCode = (code: string) => code.replace(/```python/g, "").replace(/```/g, "");

  const handleSendMessage = useCallback(async (prompt: string, model: string = "llama-3.3-70b-versatile") => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setProcessingStage(ProcessingStage.GeneratingCode);
    setStatus("generating");
    setError("");
    setCodeContent("");
    setVideoUrl(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages([userMessage]);

    try {
      const animationResponse = await generateAnimation(clerkId || "", prompt, undefined, model);
      if (!animationResponse || !animationResponse.success) {
        throw new Error(animationResponse?.error || "Failed to generate animation");
      }
      setCodeContent(animationResponse.code);
      setProcessingStage(ProcessingStage.RenderingAnimation);
      setStatus("rendering");
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: "I've created a Manim animation based on your prompt. Rendering animation...",
          timestamp: new Date(),
        },
      ]);
      if (animationResponse.videoUrl) {
        setRenderProgress(100);
        setVideoUrl(animationResponse.videoUrl);
        setStatus("complete");
        setProcessingStage(ProcessingStage.Complete);
        setIsProcessing(false);
      } else {
        throw new Error("No video URL in response");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to generate or render animation.");
      setStatus("error");
      setProcessingStage(ProcessingStage.Error);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: "Something went wrong with the animation. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [clerkId]);

  const getStatusMessage = useCallback(() => {
    switch (processingStage) {
      case ProcessingStage.GeneratingCode:
        return "Generating Manim code...";
      case ProcessingStage.RenderingAnimation:
        return `Rendering animation (${Math.floor(renderProgress)}%)...`;
      case ProcessingStage.Error:
        return "Error occurred";
      default:
        return "";
    }
  }, [processingStage, renderProgress]);

  const handleRetry = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.role === "user").pop();
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.content);
      }
    }
  }, [messages, handleSendMessage]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full rounded-2xl">
      <motion.div
        className="flex flex-1 relative rounded-2xl overflow-hidden gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left side - Chat area */}
        <div className="w-1/3 justify-stretch bg-background rounded-2xl flex flex-col h-full">
          <ScrollArea
            ref={messagesContainerRef}
            className="flex-1 overflow-hidden relative"
            scrollHideDelay={100}
            type="always"
          >
            <div className="space-y-2">
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.25, 0.1, 0.25, 1.0],
                      }}
                    >
                      <ChatMessage
                        content={message.content}
                        role={message.role}
                        isLoading={
                          message.role === "ai" &&
                          processingStage === ProcessingStage.GeneratingCode &&
                          messages[messages.length - 1].id === message.id
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-px" />
              </div>
            </div>
          </ScrollArea>
          <div className="w-full mx-auto">
            <div className="shadow-xl rounded-xl">
              <ChatPageInput
                prompt=""
                chatId={"main"}
                defaultModel="llama-3.3-70b-versatile"
                onSend={handleSendMessage}
                isDisabled={isProcessing}
              />
            </div>
          </div>
        </div>
        {/* Right side - Video/Code area */}
        <div className="w-full flex flex-col h-full overflow-hidden bg-secondary/30 border rounded-xl">
          <Tabs defaultValue="video" className="w-full h-full">
            <div className="w-full border-b py-0.5 px-1">
              <TabsList>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
            </div>
            <div className="px-2">
              <TabsContent value="video">
                <div className="flex-1">
                  {isProcessing && (
                    <div className="mb-6">
                      <div className="text-sm text-stone-400 flex items-center">
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        {getStatusMessage()}
                      </div>
                    </div>
                  )}
                  {videoUrl && !isProcessing && !error ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-full max-w-[90%]">
                        <VideoCard videoUrl={videoUrl} isLoading={false} />
                      </div>
                    </div>
                  ) : isProcessing ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-full max-w-[90%]">
                        <VideoCard videoUrl="" isLoading={true} />
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-red-300 mt-4">
                      <p className="mb-3">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="bg-red-900/30 hover:bg-red-800/40 text-white py-2 px-4 rounded-md text-sm flex items-center gap-2 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" /> Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-500 min-h-[500px]">
                      <div className="text-center p-8 border border-dashed border-stone-700 rounded-lg bg-[#0f0f0f] w-full max-w-md">
                        <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-6">
                          <Play className="h-8 w-8 text-pink-400" />
                        </div>
                        <p className="text-lg text-stone-300 font-medium">
                          No animation loaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="code">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full">
                    <ChatCodeBlock code={codeContent || ''} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

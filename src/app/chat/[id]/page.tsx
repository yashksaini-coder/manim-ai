"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatCodeBlock } from "@/components/chat/ChatCodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/chat/VideoCard";
import { Play, RefreshCw } from "lucide-react";
import ChatPageInput from "@/components/chat/chat-page-input";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cacheManager } from "@/lib/api-helpers";
import { useUser } from "@clerk/nextjs";

// Import the API client functions
import {
  createSession,
  getMessages,
  createMessage,
  updateSessionWithVideo,
  createVideo
} from "@/lib/api-client";

// Message interface for chat messages
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

// Workflow stages for animation generation
enum ProcessingStage {
  Idle = "idle",
  GeneratingCode = "generating-code",
  RenderingAnimation = "rendering-animation",
  Complete = "complete",
  Error = "error",
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams.get("prompt");
  const paramId = useParams();
  
  // Extract chat ID from params
  const chatId = typeof paramId === "object" && paramId.id
    ? Array.isArray(paramId.id) ? paramId.id[0] : paramId.id
    : params.id;

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(ProcessingStage.Idle);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [codeContent, setCodeContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<"generating" | "rendering" | "complete" | "error">("generating");
  const [renderProgress, setRenderProgress] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingInitialMessage, setIsLoadingInitialMessage] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [isInitialRequestSent, setIsInitialRequestSent] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user info from Clerk
  const { user, isLoaded: isUserLoaded } = useUser();
  const clerkId = user?.id;

  // Computed state
  const isProcessing = processingStage !== ProcessingStage.Idle && 
                      processingStage !== ProcessingStage.Complete && 
                      processingStage !== ProcessingStage.Error;

  // Helper function to clean Python code blocks
  const cleanCode = (code: string) => {
    return code.replace(/```python/g, "").replace(/```/g, "");
  };

  // Generate code via API
  const generateCode = async (prompt: string, model: string = "llama-3.3-70b-versatile") => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_PROCESSOR;
      console.log(`Connecting to ${baseUrl}/v1/generate/code`);
      
      const response = await fetch(`${baseUrl}/v1/generate/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate code: ${response.status}`);
      }

      const data = await response.json();
      return cleanCode(data.code);
    } catch (error) {
      console.error("Error generating code:", error);
      throw error;
    }
  };

  // Render animation via API
  const renderAnimation = async (code: string): Promise<string> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_PROCESSOR;
      console.log(`Connecting to ${baseUrl}/v1/render/video`);
      
      const response = await fetch(`${baseUrl}/v1/render/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode(code),
          file_name: "GenScene.py",
          file_class: "GenScene",
          iteration: Math.floor(Math.random() * 1000000),
          project_name: "GenScene",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to render animation: ${response.status}`);
      }

      const data = await response.json();
      return data.video_url;
    } catch (error) {
      console.error("Error rendering animation:", error);
      throw error;
    }
  };

  // Process user message and generate animation
  const processUserMessage = useCallback(async (prompt: string, model?: string) => {
    // Skip if this is a duplicate of the initial request
    if (isInitialRequestSent && initialPrompt === prompt) {
      console.log("Skipping duplicate API call for initial prompt");
      return;
    }
    
    // Update state to show we're processing
    setProcessingStage(ProcessingStage.GeneratingCode);
    setStatus("generating");
    
    try {
      // Start with current chat ID
      let currentSessionId = chatId;
      
      // Create session if user is signed in and we don't have a session ID yet
      if (clerkId && isUserLoaded) {
        if (!chatId.startsWith("session_")) {
          try {
            const sessionResponse = await createSession(clerkId, prompt);
            
            if (sessionResponse && sessionResponse.sessionId) {
              currentSessionId = sessionResponse.sessionId;
              console.log("Created new session:", currentSessionId);
              router.push(`/chat/${currentSessionId}`);
            } else {
              console.error("Session creation failed or returned unexpected format");
            }
          } catch (err) {
            console.error("Error creating session:", err);
          }
        }
        
        // Save the user message to database
        try {
          await createMessage(clerkId, currentSessionId, "user", prompt);
        } catch (messageError) {
          console.error("Error saving message:", messageError);
        }
      }
      
      // Check if we have cached data for this exact prompt
      const cachedData = cacheManager.getCachedData(chatId);
      if (cachedData.code && cachedData.videoUrl && cachedData.prompt === prompt) {
        console.log("Using cached data for exact prompt match");
        setCodeContent(cachedData.code);
        setVideoUrl(cachedData.videoUrl);
        setStatus("complete");
        setProcessingStage(ProcessingStage.Complete);
        return;
      }
      
      // Store the prompt in cache
      cacheManager.storePrompt(chatId, prompt);
      
      // Determine which model to use
      const modelToUse = model || cachedData.model || "llama-3.3-70b-versatile";
      cacheManager.storeModel(chatId, modelToUse);
      
      // Step 1: Generate code
      const generatedCode = await generateCode(prompt, modelToUse);
      if (!generatedCode) {
        throw new Error("Failed to generate code");
      }
      
      // Update state with generated code
      setCodeContent(generatedCode);
      setStatus("rendering");
      
      // Update AI message with code generation complete
      setMessages(prev => {
        return prev.map(msg =>
          msg.role === "ai" && msg.id === prev[prev.length - 1].id
            ? { ...msg, content: "I've created a Manim animation based on your prompt. Rendering animation..." }
            : msg
        );
      });
      
      // Save AI message with confirmation of code generation
      if (clerkId && isUserLoaded) {
        await createMessage(
          clerkId,
          currentSessionId,
          "ai",
          `I've created a Manim animation based on your prompt: "${prompt}". Here's the code.`
        );
      }
      
      // Cache the generated code
      cacheManager.storeCode(chatId, generatedCode);
      
      // Step 2: Render animation
      setProcessingStage(ProcessingStage.RenderingAnimation);
      const videoUrl = await renderAnimation(generatedCode);
      
      // Clean up any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Animation is complete
      setRenderProgress(100);
      
      // Cache and update state with video URL
      cacheManager.storeVideo(chatId, videoUrl);
      setVideoUrl(videoUrl);
      setStatus("complete");
      
      // Update AI message to show completion
      setMessages(prev => {
        return prev.map(msg =>
          msg.role === "ai" && msg.id === prev[prev.length - 1].id
            ? { ...msg, content: "Here's your animation!" }
            : msg
        );
      });
      
      // Store video in database if signed in
      if (clerkId && isUserLoaded) {
        try {
          const videoData = await createVideo(clerkId, videoUrl, generatedCode);
          
          if (videoData && videoData.videoId) {
            await updateSessionWithVideo(clerkId, currentSessionId, videoData.videoId);
            await createMessage(
              clerkId,
              currentSessionId,
              "ai",
              "Your animation is ready!",
              videoData.videoId
            );
          }
        } catch (error) {
          console.error("Error storing video:", error);
        }
      }
      
      setProcessingStage(ProcessingStage.Complete);
    } catch (error) {
      console.error("Error processing request:", error);
      setError("Failed to generate or render animation. Please try again.");
      setStatus("error");
      setProcessingStage(ProcessingStage.Error);
      
      // Update AI message with error
      setMessages(prev => {
        return prev.map(msg =>
          msg.role === "ai" && msg.id === prev[prev.length - 1].id
            ? { ...msg, content: "Something went wrong. Please try again." }
            : msg
        );
      });
      
      // Store error message
      if (clerkId && isUserLoaded) {
        await createMessage(
          clerkId,
          chatId,
          "ai",
          "Error: Failed to generate or render animation. Please try again."
        );
      }
    } finally {
      // Mark that initial API call is complete
      if (initialPrompt === prompt) {
        setIsInitialRequestSent(true);
      }
    }
  }, [initialPrompt, isInitialRequestSent, chatId, clerkId, isUserLoaded, router]);

  // Memoize dependencies to prevent useEffect dependency issues
  const memoizedDeps = useCallback(() => ({
    chatId,
    initialPrompt,
    processUserMessageFn: processUserMessage,
  }), [chatId, initialPrompt, processUserMessage]);

  // Cache memoized dependencies
  const deps = useRef(memoizedDeps()).current;

  // Load initial prompt from URL or cache
  useEffect(() => {
    const loadInitialPrompt = async () => {
      setIsLoadingInitialMessage(true);

      // Try to get prompt from URL or cache
      let promptToUse = initialPrompt;
      let modelToUse = searchParams.get("model");

      if (!promptToUse || !modelToUse) {
        const cachedData = cacheManager.getCachedData(deps.chatId);
        if (cachedData.prompt) {
          promptToUse = cachedData.prompt;
        }
        if (!modelToUse && cachedData.model) {
          modelToUse = cachedData.model;
        }
      }

      // Set default model if needed
      if (!modelToUse) {
        modelToUse = "llama-3.3-70b-versatile";
      }

      if (promptToUse) {
        // Add a small delay to allow component to mount
        await new Promise(resolve => setTimeout(resolve, 300));

        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          content: promptToUse,
          timestamp: new Date(),
        };

        setMessages([userMessage]);
        deps.processUserMessageFn(promptToUse, modelToUse);
      }

      setIsLoadingInitialMessage(false);
    };

    loadInitialPrompt();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [deps, searchParams]);

  // Handle page load animation
  useEffect(() => {
    const pageLoadTimeout = setTimeout(() => {
      setPageLoading(false);
    }, 500);

    return () => clearTimeout(pageLoadTimeout);
  }, []);

  // Handle scroll behavior
  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const scrollAreaElement = messagesContainerRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!scrollAreaElement) return;

    const handleScrollCheck = () => {
      const { scrollHeight, clientHeight, scrollTop } = scrollAreaElement as HTMLDivElement;
      const isNearBottom = scrollHeight <= scrollTop + clientHeight + 150;

      if (isNearBottom) {
        setTimeout(() => {
          (scrollAreaElement as HTMLDivElement).scrollTo({
            top: scrollHeight,
            behavior: "smooth",
          });
        }, 100);

        setShowScrollButton(false);
      } else if (messages.length > 0) {
        setShowScrollButton(true);
      }
    };

    handleScrollCheck();
  }, [messages]);

  // Handle scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollToView = () => {
        if (!messagesContainerRef.current) return;

        const scrollAreaElement = messagesContainerRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (!scrollAreaElement) return;

        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      const scrollTimeout = setTimeout(scrollToView, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages]);

  // Handle sending follow-up messages and manage the full workflow
  const handleSendMessage = useCallback(async (message: string, model?: string) => {
    if (!message.trim()) return;
    
    // 1. Add user message to the UI
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Save to database if signed in
    if (clerkId && isUserLoaded && chatId.startsWith("session_")) {
      try {
        await createMessage(clerkId, chatId, "user", message);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
    
    // 2. Add placeholder AI message
    const aiMsgId = `ai-${Date.now()}`;
    const aiMessage: Message = {
      id: aiMsgId,
      role: "ai",
      content: "Generating code for your animation...",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);
    
    // Reset state for new generation
    setCodeContent("");
    setVideoUrl("");
    setError("");
    setStatus("generating");
    setProcessingStage(ProcessingStage.GeneratingCode);

    try {
      // 3. Generate code
      const code = await generateCode(message, model || "llama-3.3-70b-versatile");
      setCodeContent(code);
      setStatus("rendering");

      // Save AI update to database
      if (clerkId && isUserLoaded) {
        await createMessage(clerkId, chatId, "ai", "Rendering animation...");
      }

      // 4. Update AI message to show rendering status
      setMessages(prev =>
        prev.map(msg =>
          msg.role === "ai" && msg.id === aiMsgId
            ? { ...msg, content: "Rendering animation..." }
            : msg
        )
      );

      // 5. Render animation
      setProcessingStage(ProcessingStage.RenderingAnimation);
      const videoUrl = await renderAnimation(code);
      setVideoUrl(videoUrl);
      setStatus("complete");

      // Store video in database
      if (clerkId && isUserLoaded) {
        try {
          const videoData = await createVideo(clerkId, videoUrl, code);
          
          if (videoData && videoData.videoId) {
            await updateSessionWithVideo(clerkId, chatId, videoData.videoId);
          }
        } catch (error) {
          console.error("Error storing video:", error);
        }
      }

      // 6. Update AI message to show completion
      setMessages(prev =>
        prev.map(msg =>
          msg.role === "ai" && msg.id === aiMsgId
            ? { ...msg, content: "Here's your animation!" }
            : msg
        )
      );

      // Save final message
      if (clerkId && isUserLoaded) {
        await createMessage(clerkId, chatId, "ai", "Here's your animation!");
      }

      setProcessingStage(ProcessingStage.Complete);
    } catch (err) {
      setError("Failed to generate or render animation.");
      setMessages(prev =>
        prev.map(msg =>
          msg.role === "ai" && msg.id === aiMsgId
            ? { ...msg, content: "Something went wrong. Please try again." }
            : msg
        )
      );
      
      // Save error message
      if (clerkId && isUserLoaded) {
        await createMessage(
          clerkId,
          chatId,
          "ai",
          "Error: Failed to generate or render animation. Please try again."
        );
      }
      
      setStatus("error");
      setProcessingStage(ProcessingStage.Error);
    }
  }, [clerkId, isUserLoaded, chatId]);

  // Get status message based on current stage
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

  // Retry in case of error
  const handleRetry = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.role === "user").pop();
      if (lastUserMessage) {
        setIsInitialRequestSent(false); // Reset flag to allow retry
        processUserMessage(lastUserMessage.content);
      }
    }
  }, [messages, processUserMessage]);

  // Load existing messages for this session
  useEffect(() => {
    const loadSessionMessages = async () => {
      if (clerkId && isUserLoaded && chatId.startsWith("session_")) {
        try {
          const messagesData = await getMessages(clerkId, chatId);
          if (messagesData && Array.isArray(messagesData) && messagesData.length > 0) {
            // Format messages from API to our Message format
            const formattedMessages = messagesData.map(msg => ({
              id: msg._id || `msg-${Date.now()}-${Math.random()}`,
              role: msg.role as "user" | "ai",
              content: msg.content,
              timestamp: new Date(msg.timestamp)
            }));
            
            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
    };

    loadSessionMessages();
  }, [clerkId, isUserLoaded, chatId]);

  return (
    <div className="flex flex-col h-full rounded-2xl">
      {/* Main content */}
      <motion.div
        className="flex flex-1 relative rounded-2xl overflow-hidden gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left side - Chat area */}
        <div className="w-1/3 justify-stretch bg-background rounded-2xl flex flex-col h-full">
          {/* Page loading state */}
          {pageLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-3 w-3 rounded-full bg-purple-400"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="h-3 w-3 rounded-full bg-purple-400"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="h-3 w-3 rounded-full bg-purple-400"
                  />
                </div>
                <p className="text-sm text-stone-400">Loading conversation...</p>
              </motion.div>
            </div>
          ) : (
            <>
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

                    <AnimatePresence>
                      {(isProcessing || isLoadingInitialMessage) &&
                        messages.length === 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChatMessage
                              content=""
                              role="ai"
                              isLoading={true}
                            />
                          </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} className="h-px" />
                  </div>
                </div>
              </ScrollArea>

              {/* Input field - show only when page is loaded */}
              {!pageLoading && (
                <div className="w-full mx-auto">
                  <div className="shadow-xl rounded-xl">
                    <ChatPageInput
                      prompt=""
                      chatId={chatId}
                      defaultModel={
                        cacheManager.getCachedData(chatId).model ||
                        "llama-3.3-70b-versatile"
                      }
                      onSend={handleSendMessage}
                      isDisabled={isProcessing}
                    />
                  </div>
                </div>
              )}
            </>
          )}
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

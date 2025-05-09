"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatCodeBlock } from '@/components/chat/ChatCodeBlock';
import { VideoCard } from '@/components/chat/VideoCard';
import { Code, Play, RefreshCw, ArrowDown } from 'lucide-react';
import AI_Prompt from '@/components/ai-chat-input';
import ChatPageInput from '@/components/chat/chat-page-input';
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from 'next/navigation';
import { generateCode, renderAnimation, cacheManager, cleanCode } from '@/lib/api-helpers';
import { useUser } from '@clerk/nextjs';
// Types for our messages
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AIResponse {
  code?: string;
  videoUrl?: string;
  error?: string;
  status?: "generating" | "rendering" | "complete" | "error";
}

// Workflow stages
enum ProcessingStage {
  Idle = "idle",
  GeneratingCode = "generating-code",
  RenderingAnimation = "rendering-animation",
  Complete = "complete",
  Error = "error"
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams.get('prompt');
  const paramId = useParams();
  const chatId = typeof paramId === 'object' && paramId.id 
    ? (Array.isArray(paramId.id) ? paramId.id[0] : paramId.id) 
    : params.id;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(ProcessingStage.Idle);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingInitialMessage, setIsLoadingInitialMessage] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [isInitialRequestSent, setIsInitialRequestSent] = useState(false);
  
  const isProcessing = processingStage !== ProcessingStage.Idle && processingStage !== ProcessingStage.Complete && processingStage !== ProcessingStage.Error;
  
  // Reference to timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleaner = (code: string) => {
    return code.replace(/```python/g, "").replace(/```/g, "");
  };

  // Process a user message with API calls
  const processUserMessage = useCallback(async (prompt: string, model?: string) => {
    // Generate a unique request ID based on prompt and model to prevent duplicate calls
    const requestId = `${prompt}_${model || 'default'}`; 
    
    // Don't make API calls if we've already sent the initial request
    if (isInitialRequestSent && initialPrompt === prompt) {
      console.log("Skipping duplicate API call for initial prompt");
      return;
    }
    
    setProcessingStage(ProcessingStage.GeneratingCode);
    setAIResponse({
      status: "generating"
    });
    
    try {
      // Store the prompt in cache first
      cacheManager.storePrompt(chatId, prompt);
      
      // Store the model if provided
      if (model) {
        cacheManager.storeModel(chatId, model);
      }
      
      // Check if we already have cached data
      if (cacheManager.hasCachedData(chatId)) {
        const cachedData = cacheManager.getCachedData(chatId);
        if (cachedData.code && cachedData.videoUrl) {
          console.log("Using cached data for", requestId);
          setAIResponse({
            code: cachedData.code,
            videoUrl: cachedData.videoUrl,
            status: "complete"
          });
          setProcessingStage(ProcessingStage.Complete);
          
          // Add AI response to chat about the previously generated code
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            role: "ai",
            content: `I've created a Manim animation based on your prompt: "${prompt}". 

This animation demonstrates your requested visualization. The code uses Manim's animation methods to create the effect you described.

Here's the animation I previously rendered for you:`,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, aiMessage]);
          return;
        }
      }
      
      const generateCode = async (prompt: string, model: string = 'llama-3.3-70b-versatile') => {
        try {
          console.log(`Connecting to ${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/generate/code`);
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/generate/code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt,
              model,
            }),
          });
      
          if (!response.ok) {
            throw new Error(`Failed to generate code: ${response.status}`);
          }
      
          const data = await response.json();
          console.log(data);
          console.log(cleaner(data.code));
          return cleaner(data.code);
        } catch (error) {
          console.error('Error generating code:', error);
        }
      };
      
      /**
       * Renders a Manim animation from code
       */
      const renderAnimation = async (code: string): Promise<string> => {
        
        
        try {
          console.log(`Connecting to ${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/render/video`);
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/render/video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: cleaner(code),
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
          console.error('Error rendering animation:', error);
          
          throw error;
        }
      };

      const generatedCode = await generateCode(prompt);
      if (!generatedCode) {
        throw new Error("Failed to generate code");
      }

      // Add AI response to chat about the generated code
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: `I've created a Manim animation based on your prompt: "${prompt}". 

This animation demonstrates your requested visualization. The code uses Manim's animation methods to create the effect you described.

I'm now rendering this animation for you...`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setAIResponse({
        code: generatedCode,
        status: "rendering"
      });

      // Cache the generated code
      cacheManager.storeCode(chatId, generatedCode);
      
      // Store the model too (this was accidentally removed)
      cacheManager.storeModel(chatId, model || 'llama-3.3-70b-versatile');
      
      // Step 2: Start rendering animation
      setProcessingStage(ProcessingStage.RenderingAnimation);
      
      // Step 3: Render animation using API
      const videoUrl = await renderAnimation(generatedCode);
      
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set render progress to 100% when complete
      setRenderProgress(100);
      
      // Cache the video URL
      cacheManager.storeVideo(chatId, videoUrl);
      
      // Update with the video URL once rendering is complete
      setAIResponse(prev => ({
        ...prev!,
        videoUrl,
        status: "complete"
      }));
      
      setProcessingStage(ProcessingStage.Complete);
      
    } catch (error) {
      console.error("Error processing request:", error);
      setAIResponse({
        error: "Failed to generate or render animation. Please try again.",
        status: "error"
      });
      setProcessingStage(ProcessingStage.Error);
    } finally {
      // Mark that we've made the initial API call
      if (initialPrompt === prompt) {
        setIsInitialRequestSent(true);
      }
    }
  }, [initialPrompt, isInitialRequestSent, chatId]);

  // Use memoized dependencies to prevent useEffect dependency issues
  const memoizedDeps = useCallback(() => {
    return {
      chatId,
      initialPrompt,
      processUserMessageFn: processUserMessage
    }
  }, [chatId, initialPrompt, processUserMessage]);
  
  // Cache the memoized dependencies
  const deps = useRef(memoizedDeps()).current;

  // Use useEffect to set the initial value when prompt changes
  useEffect(() => {
    const loadInitialPrompt = async () => {
      setIsLoadingInitialMessage(true);
      
      // First check URL parameters
      let promptToUse = initialPrompt;
      let modelToUse = searchParams.get('model');
      
      // If not found in URL, try localStorage via cacheManager
      if (!promptToUse || !modelToUse) {
        const cachedData = cacheManager.getCachedData(deps.chatId);
        if (cachedData.prompt) {
          promptToUse = cachedData.prompt;
        }
        if (!modelToUse && cachedData.model) {
          modelToUse = cachedData.model;
        }
      }

      // Ensure we have a default model if none was found
      if (!modelToUse) {
        modelToUse = 'gemma-2-9b-it';
      }
      
      if (promptToUse) {
        // Add initial user message with a small delay to allow component to mount
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

  // Handle initial page load animation
  useEffect(() => {
    // Short timeout to ensure smooth page transition
    const pageLoadTimeout = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    
    return () => clearTimeout(pageLoadTimeout);
  }, []);

  // Enhanced scroll behavior with better detection
  useEffect(() => {
    if (!messagesContainerRef.current) return;
        
    // When using shadcn ScrollArea, we need to access the scrollable element differently
    const scrollAreaElement = messagesContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollAreaElement) return;
    
    const handleScrollCheck = () => {
      const { scrollHeight, clientHeight, scrollTop } = scrollAreaElement as HTMLDivElement;
      
      // More precise check if user is at the bottom (within 150px)
      const isNearBottom = scrollHeight <= scrollTop + clientHeight + 150;
      
      if (isNearBottom) {
        // Use a small timeout to ensure DOM has updated
        setTimeout(() => {
          (scrollAreaElement as HTMLDivElement).scrollTo({
            top: scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
        
        setShowScrollButton(false);
      } else if (messages.length > 0) {
        // Only show scroll button if we have messages and user has scrolled up
        setShowScrollButton(true);
      }
    };

    // Initial check
    handleScrollCheck();
    
    return () => {
      // No event listeners to clean up in this effect
    };
  }, [messages]);
  
  // Smoother scroll to bottom with easing
  const scrollToBottom = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    // Get the actual scrollable viewport from shadcn ScrollArea
    const scrollAreaElement = messagesContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollAreaElement) return;
    
    const scrollHeight = (scrollAreaElement as HTMLDivElement).scrollHeight;
    
    (scrollAreaElement as HTMLDivElement).scrollTo({
      top: scrollHeight,
      behavior: 'smooth'
    });
    
    setShowScrollButton(false);
  }, []);

  // Scroll to top for long conversations
  const scrollToTop = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    // Get the actual scrollable viewport from shadcn ScrollArea
    const scrollAreaElement = messagesContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollAreaElement) return;
    
    (scrollAreaElement as HTMLDivElement).scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  // Add scroll listener to handle both scroll buttons
  // useEffect(() => {
  //   if (!messagesContainerRef.current) return;
    
  //   // Get the actual scrollable viewport from shadcn ScrollArea
  //   const scrollAreaElement = messagesContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
  //   if (!scrollAreaElement) return;
    
  //   const handleScroll = () => {
  //     const { scrollHeight, clientHeight, scrollTop } = scrollAreaElement as HTMLDivElement;
      
  //     // Show/hide bottom scroll button based on position
  //     if (scrollHeight <= scrollTop + clientHeight + 150) {
  //       setShowScrollButton(false);
  //     } else if (messages.length > 0) {
  //       setShowScrollButton(true);
  //     }
  //   };
    
  //   scrollAreaElement.addEventListener('scroll', handleScroll);
  //   return () => scrollAreaElement.removeEventListener('scroll', handleScroll);
  // }, [messages.length]);
  
  // Update render progress with memoized function
  const updateRenderProgress = useCallback(() => {
    if (processingStage === ProcessingStage.RenderingAnimation) {
      const newProgress = renderProgress + Math.random() * 10;
      if (newProgress < 100) {
        setRenderProgress(Math.min(newProgress, 99));
        timeoutRef.current = setTimeout(updateRenderProgress, 500);
      } else {
        setRenderProgress(100);
        completeRendering();
      }
    }
  }, [processingStage, renderProgress]);
  
  // Complete rendering with memoized function
  const completeRendering = useCallback(() => {
    setProcessingStage(ProcessingStage.Complete);
    setAIResponse(prev => ({
      ...prev!,
      status: "complete"
    }));
  }, []);
  
  // Handle sending follow-up messages
  const handleSendMessage = useCallback((message: string, model?: string) => {
    if (!message.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setRenderProgress(0);
    
    // Make sure we have the chat id from params
    const currentChatId = chatId || '';
    
    // Store the message in localStorage
    cacheManager.storePrompt(currentChatId, message);
    
    // Store the model if provided
    if (model) {
      cacheManager.storeModel(currentChatId, model);
    }
    
    // Process the message using our API functions
    processUserMessage(message, model);
  }, [processUserMessage, chatId]);
  
  // Get status message based on current processing stage
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
  
  // Go back to landing page
  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  // Scroll to messagesEnd when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      // Find the scroll viewport and scroll to the messages end
      const scrollToView = () => {
        if (!messagesContainerRef.current) return;
        
        const scrollAreaElement = messagesContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollAreaElement) return;
        
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };
      
      // Small delay to ensure DOM is updated
      const scrollTimeout = setTimeout(scrollToView, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full rounded-2xl">      
      {/* Main content */}
      <motion.div 
        className="flex flex-1 relative rounded-2xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left side - Chat area */}
        <div className="w-2/5 border-2 border-blue-500 justify-stretch bg-background rounded-2xl flex border-spacing-4 mx-4 flex-col h-full">
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
                <p className="text-sm text-gray-400">Loading conversation...</p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Messages container with enhanced scrolling using ScrollArea */}
              <ScrollArea 
                ref={messagesContainerRef}
                className="flex-1 overflow-hidden relative"
                scrollHideDelay={100}
                type="always"
              >
                <div className="py-4 space-y-4">
                  <div className="space-y-4 mx-auto max-w-[95%]">
                    {/* Messages with AnimatePresence for better transitions */}
                    <AnimatePresence initial={false}>
                      {messages.map((message) => (
                        <motion.div 
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ 
                            duration: 0.4,
                            ease: [0.25, 0.1, 0.25, 1.0]
                          }}
                        >
                          <ChatMessage 
                            content={message.content} 
                            role={message.role}
                            isLoading={message.role === "ai" && processingStage === ProcessingStage.GeneratingCode && messages[messages.length - 1].id === message.id}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* AI is responding - show loading indicator if no messages yet */}
                    <AnimatePresence>
                      {(isProcessing || isLoadingInitialMessage) && messages.length === 0 && (
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
                    
                    {/* Show code block if available */}
                    <AnimatePresence>
                      {aiResponse?.code && (
                        <motion.div 
                          className="mt-6 relative mx-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <div className="absolute -top-6 left-0 flex items-center gap-2 text-pink-400 text-sm font-medium">
                            <Code className="h-4 w-4" />
                            <span>Generated Python Code</span>
                          </div>
                          <ChatCodeBlock code={aiResponse.code} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-px" />
                  </div>
                </div>
              </ScrollArea>
              
              {/* New message button with enhanced animation */}
              <AnimatePresence>
                {showScrollButton && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-24 left-[20%] transform -translate-x-1/2 z-10"
                  >
                    <motion.button 
                      onClick={scrollToBottom}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full shadow-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <ArrowDown className="h-4 w-4" /> New message
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Input field - fixed at bottom - show only when page is loaded */}
              {!pageLoading && (
                <div className="pt-4 px-6 pb-4 bg-gray-950 rounded-2xl">
                  <div className="w-full mx-auto">
                    <div className="shadow-xl rounded-xl">
                      <ChatPageInput 
                        prompt="" 
                        chatId={chatId}
                        defaultModel={searchParams.get('model') || undefined}
                        onSend={(message, model) => {
                          handleSendMessage(message, model);
                        }}
                        isDisabled={isProcessing} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Right side - Video area */}
        <div className="w-3/5 flex flex-col h-full overflow-hidden bg-zinc-800 rounded-2xl">
          <div className="flex-1 p-6">
            {/* Processing status indicator */}
            {isProcessing && (
              <div className="mb-6">
                <div className="text-sm text-gray-400 flex items-center">
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  {getStatusMessage()}
                </div>
              </div>
            )}
            
            {/* Show content based on state - Removed AnimatePresence */}
            {/* Show video if available */}
            {aiResponse?.videoUrl ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-[90%] flex justify-center">
                  <VideoCard 
                    videoUrl={aiResponse.videoUrl || ""}
                    isLoading={false}
                  />
                </div>
              </div>
            ) : !isProcessing && !aiResponse?.error ? (
              // Empty state
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[500px]">
                
                <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg bg-[#0f0f0f] w-full max-w-md">
                  <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-6">
                    <Play className="h-8 w-8 text-pink-400" />
                  </div>
                  <p className="text-lg text-gray-300 font-medium">
                    Enter a prompt to generate a Manim animation
                  </p>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    Try something like: "Create a bouncing ball animation with trail effects", "Animate the quadratic formula", or "Show a sine wave transform"
                  </p>
                </div>
              </div>
            ) : isProcessing ? (
              // Show loading state when processing
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-[90%]">
                  <VideoCard 
                    videoUrl="" 
                    isLoading={true}
                  />
                </div>
              </div>
            ) : null}
            
            {/* Show error if any */}
            {aiResponse?.error && (
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-red-300 mt-4">
                <p className="mb-3">{aiResponse.error}</p>
                <button 
                  onClick={handleRetry} 
                  className="bg-red-900/30 hover:bg-red-800/40 text-white py-2 px-4 rounded-md text-sm flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
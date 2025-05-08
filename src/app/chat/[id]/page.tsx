"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatCodeBlock } from '@/components/chat/ChatCodeBlock';
import { VideoCard } from '@/components/chat/VideoCard';
import { Code, Play, RefreshCw, ArrowDown } from 'lucide-react';
import AI_Prompt from '@/components/ai-chat-input';
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const model = searchParams.get('model');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(ProcessingStage.Idle);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  
  const isProcessing = processingStage !== ProcessingStage.Idle && processingStage !== ProcessingStage.Complete && processingStage !== ProcessingStage.Error;
  
  // Reference to timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mock API call - replace with your actual API
  const processUserMessage = async (prompt: string) => {
    setProcessingStage(ProcessingStage.GeneratingCode);
    setAIResponse({
      status: "generating"
    });
    
    try {
      // Step 1: Generate code (simulate API call with delay)
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, 3000);
      });
      
      // Mock code generation response
      const generatedCode = `from manim import *

class SquareToCircle(Scene):
    def construct(self):
        # Create a square
        square = Square(side_length=2, color=BLUE)
        
        # Create a circle
        circle = Circle(radius=1, color=RED)
        
        # Display the square
        self.play(Create(square))
        
        # Transform the square into a circle
        self.play(Transform(square, circle))
        
        # Wait for a second at the end
        self.wait()`;
      
      // Add AI response to chat about the generated code
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: `I've created a Manim animation based on your prompt: "${prompt}". 

This animation demonstrates a simple transformation from a square to a circle. The code uses Manim's \`Create\` method to display a blue square, and then uses the \`Transform\` method to smoothly convert it into a red circle.

I'm now rendering this animation for you...`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setAIResponse({
        code: generatedCode,
        status: "rendering"
      });
      
      // Step 2: Start rendering animation
      setProcessingStage(ProcessingStage.RenderingAnimation);
      
      // Step 3: Complete rendering after a delay (in real app, would wait for actual render)
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, 8000);
      });
      
      // Update with the video URL once "rendering" is complete
      setAIResponse(prev => ({
        ...prev!,
        videoUrl: "https://assets.codepen.io/308367/firefly-5713-manim.mp4",
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
    }
  };
  
  // Handle initial prompt from URL
  useEffect(() => {
    if (initialPrompt) {
      // Add initial user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: initialPrompt,
        timestamp: new Date(),
      };
      
      setMessages([userMessage]);
      processUserMessage(initialPrompt);
    }
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [initialPrompt]);
  
  // Enhanced scroll behavior with better detection
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    // When using shadcn ScrollArea, we need to access the scrollable element differently
    const scrollAreaElement = messagesContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollAreaElement) return;
    
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
  }, [messages]);
  
  // Smoother scroll to bottom with easing
  const scrollToBottom = () => {
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
  };
  
  // Scroll to top for long conversations
  const scrollToTop = () => {
    if (!messagesContainerRef.current) return;
    
    // Get the actual scrollable viewport from shadcn ScrollArea
    const scrollAreaElement = messagesContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollAreaElement) return;
    
    (scrollAreaElement as HTMLDivElement).scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Add scroll listener to handle both scroll buttons
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    // Get the actual scrollable viewport from shadcn ScrollArea
    const scrollAreaElement = messagesContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollAreaElement) return;
    
    const handleScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = scrollAreaElement as HTMLDivElement;
      
      // Show/hide bottom scroll button based on position
      if (scrollHeight <= scrollTop + clientHeight + 150) {
        setShowScrollButton(false);
      } else if (messages.length > 0) {
        setShowScrollButton(true);
      }
      
      // Show top scroll button only when scrolled down significantly
      setShowScrollTopButton(scrollTop > 300);
    };
    
    scrollAreaElement.addEventListener('scroll', handleScroll);
    return () => scrollAreaElement.removeEventListener('scroll', handleScroll);
  }, [messages.length]);
  
  const updateRenderProgress = () => {
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
  };
  
  const completeRendering = () => {
    setProcessingStage(ProcessingStage.Complete);
    setAIResponse(prev => ({
      ...prev!,
      status: "complete"
    }));
  };
  
  // Handle sending follow-up messages
  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setRenderProgress(0);
    processUserMessage(message);
  };
  
  // Get status message based on current processing stage
  const getStatusMessage = () => {
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
  };
  
  // Retry in case of error
  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.role === "user").pop();
      if (lastUserMessage) {
        processUserMessage(lastUserMessage.content);
      }
    }
  };
  
  // Go back to projects
  const handleBack = () => {
    router.push('/');
  };

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
      setTimeout(scrollToView, 100);
    }
  }, [initialPrompt]);

  return (
    <div className="flex flex-col h-full rounded-2xl">      
      {/* Main content */}
      <div className="flex flex-1 relative rounded-2xl overflow-hidden">
        {/* Left side - Chat area */}
        <div className="w-2/5 border justify-stretch bg-gray-950 rounded-2xl flex border-spacing-4 mx-4 flex-col h-full">
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
                  {isProcessing && messages.length === 0 && (
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
          
          {/* Scroll to top button
          <AnimatePresence>
            {showScrollTopButton && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="fixed top-24 left-[20%] transform -translate-x-1/2 z-10"
              >
                <motion.button 
                  onClick={scrollToTop}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-full shadow-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <ArrowUp className="h-4 w-4" /> Top
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
           */}
          
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
          
          {/* Input field - fixed at bottom */}
          <div className="pt-4 px-6 pb-4 bg-gray-950 rounded-2xl">
            <div className="w-full mx-auto">
              <div className="shadow-xl rounded-xl">
                <AI_Prompt 
                  prompt="" 
                  onSend={handleSendMessage}
                  isDisabled={isProcessing} 
                />
              </div>
            </div>
          </div>
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
                    videoUrl={aiResponse.videoUrl}
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
      </div>
    </div>
  );
} 
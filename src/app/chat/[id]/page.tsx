"use client";

import { notFound } from 'next/navigation';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatCodeBlock } from '@/components/chat/ChatCodeBlock';
import { VideoCard } from '@/components/chat/VideoCard';
import { ChatInput } from '@/components/chat/ChatInput';
import { Code, Video, Play, RefreshCw, ChevronLeft } from 'lucide-react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import AI_Prompt from '@/components/ai-chat-input';
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

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
  
  const isProcessing = processingStage !== ProcessingStage.Idle && processingStage !== ProcessingStage.Complete && processingStage !== ProcessingStage.Error;
  
  // Reference to timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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

  return (
    <div className="flex flex-col h-screen border-2 flex-1  border-red-500/10 bg-[#0f0f0f]">      
      {/* Main content */}
      <div className="flex flex-1 min-h-screen overflow-hidden">
        {/* Left side - Chat area */}
        <div className="w-2/5 border-r border-[#232323] border-2 border-red-500 flex flex-col h-full">
          {/* Messages container with fixed height and scrolling */}
          <div className="flex-1 overflow-y-auto border-2 border-blue-500 top-5 scrollbar-thin">
            <div className="py-4 space-y-4">
              <div className="space-y-4 mx-auto max-w-[95%]">
                {/* Messages */}
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatMessage 
                      content={message.content} 
                      role={message.role}
                      isLoading={message.role === "ai" && processingStage === ProcessingStage.GeneratingCode && messages[messages.length - 1].id === message.id}
                    />
                  </div>
                ))}
                
                {/* AI is responding - show loading indicator if no messages yet */}
                {isProcessing && messages.length === 0 && (
                  <div>
                    <ChatMessage 
                      content="" 
                      role="ai" 
                      isLoading={true} 
                    />
                  </div>
                )}
                
                {/* Show code block if available */}
                {aiResponse?.code && (
                  <div 
                    className="mt-6 relative mx-4"
                  >
                    <div className="absolute -top-6 left-0 flex items-center gap-2 text-pink-400 text-sm font-medium">
                      <Code className="h-4 w-4" />
                      <span>Generated Python Code</span>
                    </div>
                    <ChatCodeBlock code={aiResponse.code} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
          
          {/* Input field - floating above bottom border */}
          <div className="pb-18 pt-4 px-6 relative">
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
        <div className="w-3/5 flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
          <div className="flex-1 overflow-y-auto p-6">
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
                <div className="w-full max-w-[90%]">
                  <VideoCard 
                    videoUrl={aiResponse.videoUrl}
                    isLoading={false}
                  />
                </div>
                
                {aiResponse.code && (
                  <div className="w-full mt-6 p-4 bg-[#131313] rounded-lg border border-[#232323] text-gray-300 max-w-[90%]">
                    <h3 className="text-lg font-medium mb-2 text-white">Animation Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Animation Type</p>
                        <p>Square to Circle Transform</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Duration</p>
                        <p>3.5 seconds</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Resolution</p>
                        <p>1280 x 720</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Renderer</p>
                        <p>Cairo</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : !isProcessing && !aiResponse?.error ? (
              // Empty state
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[500px]">
                <div className="w-full text-2xl font-semibold text-pink-400 mb-8 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  <span>Animation Preview</span>
                </div>
                
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
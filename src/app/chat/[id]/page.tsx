"use client";

import { notFound } from 'next/navigation';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatCodeBlock } from '@/components/chat/ChatCodeBlock';
import { VideoCard } from '@/components/chat/VideoCard';
import { ChatInput } from '@/components/chat/ChatInput';
import { Code, Video, Play, RefreshCw } from 'lucide-react';
import { ChatHeader } from '@/components/chat/ChatHeader';

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
      setRenderProgress(0);
      updateRenderProgress();
      
      // Step 3: Complete rendering after a delay (in real app, would wait for actual render)
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, 8000);
      });
      
      // Update with the video URL once "rendering" is complete
      // In a real app, this would be the URL returned from your backend
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

  return (
    <>
      {/* Main content */}
      <div className="flex h-full w-full">
        {/* Left side - Chat area */}
        <div className=" w-1/2 border-r border-[#232323] flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Messages */}
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  content={message.content} 
                  role={message.role}
                  isLoading={message.role === "ai" && processingStage === ProcessingStage.GeneratingCode && messages[messages.length - 1].id === message.id}
                />
              ))}
              
              {/* AI is responding - show loading indicator if no messages yet */}
              {isProcessing && messages.length === 0 && (
                <ChatMessage 
                  content="" 
                  role="ai" 
                  isLoading={true} 
                />
              )}
              
              {/* Show code block if available */}
              {aiResponse?.code && (
                <div className="mt-4 relative">
                  <div className="absolute -top-6 left-0 flex items-center gap-2 text-pink-400 text-sm font-medium">
                    <Code className="h-4 w-4" />
                    <span>code generated</span>
                  </div>
                  <ChatCodeBlock code={aiResponse.code} />
                </div>
              )}
            </div>
          </div>
          
          {/* Input field - fixed at bottom with sidebar width */}
          <div className="p-4 border-t border-[#232323] bg-[#121212]">
            <div className="max-w-3xl mx-auto">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
        
        {/* Right side - Video area */}
        <div className="w-1/2 flex flex-col h-full p-6 overflow-y-auto">
          {/* Processing status indicator */}
          {isProcessing && (
            <div className="mb-6">
              <div className="w-full bg-[#1e1e1e] rounded-full h-2.5 mb-2">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${renderProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 flex items-center">
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                {getStatusMessage()}
              </div>
            </div>
          )}
          
          {/* Show video if available */}
          {aiResponse?.videoUrl ? (
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full text-2xl font-semibold text-green-400 mb-8 flex items-center gap-2">
                <Video className="h-5 w-5" />
                <span>Animation Preview</span>
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
                <VideoCard videoUrl={aiResponse.videoUrl} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="w-full text-2xl font-semibold text-green-400 mb-8 flex items-center gap-2">
                <Video className="h-5 w-5" />
                <span>Animation Preview</span>
              </div>
              
              {!isProcessing && !aiResponse?.error && (
                <div className="text-center mt-8 p-8 border border-dashed border-gray-700 rounded-lg bg-[#191919] w-full max-w-md">
                  <Play className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-lg text-gray-400">
                    Enter a prompt to generate a Manim animation
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    For example: "Create a bouncing ball animation" or "Show a sine wave transform"
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Show error if any */}
          {aiResponse?.error && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-red-300 mt-4">
              <p className="mb-3">{aiResponse.error}</p>
              <button 
                onClick={handleRetry} 
                className="bg-red-900/30 hover:bg-red-800/40 text-white py-1 px-3 rounded-md text-sm flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
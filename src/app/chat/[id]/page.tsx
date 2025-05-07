"use client";

import { notFound } from 'next/navigation';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Monitor, Moon } from "lucide-react";
import Link from 'next/link';

export default function ChatPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prompt = searchParams.get('prompt');
  const model = searchParams.get('model');
  const [loading, setLoading] = useState(true);

  // Simulate loading state for the response
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#111927] text-white overflow-hidden">

      <div className="flex-1 flex flex-col mx-auto w-full max-w-4xl p-0">
        <div className="flex-1 p-4 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-medium">Chat Session: {params.id.substring(0, 8)}</h2>
            {model && <p className="text-sm text-gray-400">Using model: {model}</p>}
          </div>
          
          <div className="flex-1 flex flex-col space-y-6">
            {/* User Message */}
            {prompt && (
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2 max-w-[80%]">
                  <p className="text-white">{prompt}</p>
                </div>
              </div>
            )}
            
            {/* AI Response */}
            <div className="flex">
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">AI</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#293040] px-4 py-2">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-gray-300">Generating response...</p>
                    </div>
                  ) : (
                    <p className="text-gray-200">
                      I received your prompt: "{prompt}". For a proper response, I would need to
                      generate Manim code and a video animation. This feature is coming soon!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Input field at the bottom */}
        <div className="border-t border-[#293040] p-4 bg-[#161E2E]">
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Send a follow-up message..." 
              className="w-full bg-[#111927] border border-[#293040] rounded-full px-4 py-2 outline-none text-gray-200 focus:ring-1 focus:ring-blue-500" 
            />
            <button className="ml-2 p-2 rounded-full bg-blue-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
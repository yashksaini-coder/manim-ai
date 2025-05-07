"use client";

import { notFound } from 'next/navigation';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* Top navigation bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
        <div className="mx-auto">
          <h1 className="text-lg font-medium">Manim AI Chat</h1>
        </div>
        <div className="w-[100px]"></div> {/* Spacer for centering */}
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8">
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-lg font-medium">Chat Session: {params.id.substring(0, 8)}</h2>
            {model && <p className="text-xs text-gray-400">Using model: {model}</p>}
          </div>
          
          <div className="p-6 flex-1 flex flex-col space-y-6 min-h-[400px]">
            {/* User Message */}
            {prompt && (
              <div className="flex items-start gap-3 self-end">
                <div className="bg-blue-600 rounded-lg p-3 max-w-[80%]">
                  <p className="text-white">{prompt}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold">You</span>
                </div>
              </div>
            )}
            
            {/* AI Response */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-xs font-bold">AI</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-gray-300">Generating response...</p>
                  </div>
                ) : (
                  <p className="text-gray-300">
                    I received your prompt: "{prompt}". For a proper response, I would need to
                    generate Manim code and a video animation. This feature is coming soon!
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Input field for future use */}
          <div className="p-4 border-t border-gray-800 bg-gray-900/50">
            <div className="border border-gray-700 rounded-lg px-4 py-2 flex justify-between bg-gray-800/50">
              <input 
                type="text" 
                disabled 
                placeholder="Send a follow-up message..." 
                className="bg-transparent flex-1 outline-none text-gray-300" 
              />
              <button disabled className="ml-2 p-2 rounded-full bg-gray-700 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
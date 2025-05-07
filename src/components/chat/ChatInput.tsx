"use client";

import { SendHorizontal, Paperclip } from "lucide-react";
import { FormEvent, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Detect shift+enter to create a new line
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !disabled) {
        onSendMessage(message);
        setMessage("");
      }
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage("");
  };
  
  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <div 
        className={`w-full rounded-full bg-[#232323] ${isFocused ? 'ring-1 ring-white/20' : ''} px-4 py-2 transition-all duration-300`}
      >
        <form onSubmit={handleSubmit} className="flex items-center">
          <input 
            ref={inputRef}
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What can I do for you?" 
            className="w-full bg-transparent border-none outline-none text-gray-200 py-2 placeholder-gray-500 focus:placeholder-gray-400 transition-colors" 
            disabled={disabled}
          />
          
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-white p-2 rounded-md transition-all"
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </motion.button>
            
            <motion.button 
              type="submit"
              disabled={!message.trim() || disabled}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full ${message.trim() && !disabled ? 'text-white hover:bg-white/10' : 'text-gray-600'} flex items-center justify-center`}
            >
              <SendHorizontal className="h-5 w-5" />
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 
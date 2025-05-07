"use client";

import { Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { motion } from "framer-motion";

type MessageRole = "user" | "ai";

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  isLoading?: boolean;
  children?: ReactNode;
}

export function ChatMessage({ content, role, isLoading = false, children }: ChatMessageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 py-6 text-gray-200"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Analyzing request...</p>
        </div>
      ) : (
        <div>
          {role === "user" ? (
            <div className="flex flex-col">
              <span className="mt-16 text-xs text-gray-500 mb-1">You</span>
              <p>{content}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Manim</span>
              <p>{content}</p>
            </div>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      )}
    </motion.div>
  );
} 
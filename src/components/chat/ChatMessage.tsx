"use client";

import { Bot, Loader2, User } from "lucide-react";
import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      className={cn(
        "group relative w-full rounded-lg transition-all",
        role === "user" ? "pl-2" : "pl-2"
      )}
      layout="position"
    >
      <div className={cn(
        "flex w-full items-start gap-4 p-4 rounded-lg",
        role === "user" ? "bg-gray-800/30" : "bg-gray-800/10"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border",
          role === "user" 
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600" 
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600"
        )}>
          {role === "user" ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          {/* Role Label */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-medium",
              role === "user" ? "text-blue-400" : "text-purple-400"
            )}>
              {role === "user" ? "You" : "Manim AI"}
            </span>
          </div>
          
          {/* Message Content */}
          {isLoading ? (
            <div className="flex items-center gap-3 text-gray-400 min-h-[24px]">
              <div className="flex space-x-1">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-purple-400"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="h-2 w-2 rounded-full bg-purple-400"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="h-2 w-2 rounded-full bg-purple-400"
                />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          ) : (
            <div className={cn(
              "prose prose-gray dark:prose-invert max-w-none",
              "text-sm leading-relaxed"
            )}>
              <p className="whitespace-pre-line">{content}</p>
            </div>
          )}
          
          {/* Optional Children */}
          {children && <div className="pt-3">{children}</div>}
        </div>
      </div>
    </motion.div>
  );
} 
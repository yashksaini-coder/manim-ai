"use client";

import { Bot, Loader2, User } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type MessageRole = "user" | "ai";

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  isLoading?: boolean;
  children?: ReactNode;
}

export function ChatMessage({ content, role, isLoading = false, children }: ChatMessageProps) {
  // Add state to control fading between loading and content
  const [showLoading, setShowLoading] = useState(isLoading);
  const [showContent, setShowContent] = useState(!isLoading && content.length > 0);

  // Handle transitions between loading and content states
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      setShowLoading(true);
      setShowContent(false);
    } else if (content) {
      // When switching from loading to content, add a small delay for a smooth transition
      timeout = setTimeout(() => {
        setShowLoading(false);
        setShowContent(true);
      }, 300);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0],
        staggerChildren: 0.1
      }}
      className={cn(
        "group relative w-full rounded-lg bg-background transition-all",
        "p-0"
      )}
    >
      <div
        className={cn(
          // Use items-center for vertical alignment of avatar and text
          "flex w-full items-center gap-3 px-4 py-2 rounded-lg",
          role === "user" ? "bg-gray-800/30" : "bg-gray-800/10"
        )}
      >
        {/* Avatar with animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={cn(
            // Center avatar content and ensure perfect circle
            "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full",
            role === "user"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600"
          )}
          style={{
            // Add a little margin to separate from text
            marginRight: "0.75rem"
          }}
        >
          {role === "user" ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </motion.div>

        <div className="flex-1 space-y-2">
          {/* Role Label with animation */}
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-2"
          >
            {/* <span className={cn(
              "text-xs font-medium",
              role === "user" ? "text-blue-400" : "text-purple-400"
            )}>
              {role === "user" ? "You" : "Manim AI"}
            </span> */}
          </motion.div>

          {/* Message Content with AnimatePresence for smooth transitions */}
          <div className="min-h-[24px]">
            <AnimatePresence mode="wait">
              {showLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 text-gray-400"
                >
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
                </motion.div>
              )}

              {showContent && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "prose prose-gray dark:prose-invert max-w-none",
                    "text-sm leading-relaxed"
                  )}
                >
                  <ScrollArea className="w-full max-h-[300px] overflow-auto pr-3">
                    <p className="whitespace-pre-line">{content}</p>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Optional Children with animation */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="pt-3"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
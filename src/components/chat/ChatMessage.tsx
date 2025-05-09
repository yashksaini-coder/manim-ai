"use client";

import { Bot, Loader2, User } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser } from "@clerk/nextjs";

type MessageRole = "user" | "ai";

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  isLoading?: boolean;
  children?: ReactNode;
}

export function ChatMessage({
  content,
  role,
  isLoading = false,
  children,
}: ChatMessageProps) {
  // Add state to control fading between loading and content
  const { user } = useUser();
  const [showLoading, setShowLoading] = useState(isLoading);
  const [showContent, setShowContent] = useState(
    !isLoading && content.length > 0
  );

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
        staggerChildren: 0.1,
      }}
      className={cn(
        "group relative w-full rounded-lg bg-background transition-all",
        "p-0"
      )}
    >
      <div
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2 rounded-lg",
          role === "user" ? "bg-secondary/30" : "bg-secondary/10"
        )}
      >
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>
            {role === "user" ? (
              <User className="h-5 w-5 " />
            ) : (
              <Bot className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
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
                  className="flex items-center gap-3 text-stone-400"
                >
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-purple-400"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                      className="h-2 w-2 rounded-full bg-purple-400"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
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
                    "prose prose-stone dark:prose-invert max-w-none",
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

"use client";

import { MoonIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHeaderProps {
  sessionId?: string;
  model?: string | null;
}

export function ChatHeader({ sessionId, model }: ChatHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full bg-[#121212] border-b border-[#232323] px-6 py-3 flex items-center justify-between h-16"
    >
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21.3333 11.6667H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.3333 17.3333H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-white"
          >
            Manim AI
          </motion.h1>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <MoonIcon className="h-4 w-4" />
        </motion.button>
        
        {model && (
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-gray-400"
            >
              Model: {model}
            </motion.div>
          </div>
        )}
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center cursor-pointer overflow-hidden"
          >
            <Image 
              src="https://github.com/shadcn.png"
              alt="Profile" 
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute right-0 mt-2 w-48 rounded-md bg-[#1a1a1a] border border-[#232323] shadow-lg z-50"
              >
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#232323] hover:text-white">Your Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#232323] hover:text-white">Settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#232323] hover:text-white">Help</a>
                  <div className="border-t border-[#232323] my-1"></div>
                  <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-[#232323] hover:text-red-300">Sign out</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.header>
  );
} 
"use client";

import { CopyIcon } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface ChatCodeBlockProps {
  code: string;
  language?: string;
}

export function ChatCodeBlock({ code, language = "python" }: ChatCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-md overflow-hidden bg-[#191919] relative"
    >
      <div className="relative">
        <pre 
          ref={codeRef} 
          className="p-4 text-sm font-mono text-green-300 overflow-x-auto"
        >
          <code>{code}</code>
        </pre>
        
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded bg-[#333]/80 hover:bg-[#444]/80 text-gray-400 hover:text-white transition-colors"
        >
          <CopyIcon size={14} />
        </button>
      </div>
      
      <div className="px-4 py-1.5 bg-[#222] text-xs text-gray-400 flex justify-between">
        <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
        <span>{code.split('\n').length} lines</span>
      </div>
    </motion.div>
  );
} 
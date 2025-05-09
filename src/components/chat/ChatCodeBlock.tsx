"use client";

import { CopyIcon } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CodeBlock } from "../ui/code-block";

interface ChatCodeBlockProps {
  code: string;
  language?: string;
}

export function ChatCodeBlock({
  code,
  language = "python",
}: ChatCodeBlockProps) {
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
      className="rounded-mdbg-secondary/10 relative"
    >
      <div className="relative">
        <CodeBlock
          language={language}
          code={code}
        />
      </div>
    </motion.div>
  );
}

"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "ai";
  content: string;
  code?: string;
  videoUrl?: string;
};

export default function AIChatInput() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cleaner = (code: string) => {
    return code.replace(/```python/g, "").replace(/```/g, "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    try {
      // 1. Generate code from query
      const codeRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/generate/code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: query }),
        }
      );
      const codeData = await codeRes.json();
      const cleanedCode = cleaner(codeData.code);

      // 2. Generate video from cleaned code
      const videoRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/render/video`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: cleanedCode,
            file_name: "GenScene.py",
            file_class: "GenScene",
            iteration: Math.floor(Math.random() * 1000000),
            project_name: "GenScene",
          }),
        }
      );
      const videoData = await videoRes.json();

      // Add AI message
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Here is your generated code and video!",
          code: cleanedCode,
          videoUrl: videoData.video_url,
        },
      ]);
    } catch (err) {
      setError("Failed to generate video. Please try again.");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="overflow-y-auto max-h-[400px] mb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              className={`mb-4 flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              initial={{ opacity: 0, x: msg.role === "user" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: msg.role === "user" ? 50 : -50 }}
              transition={{ duration: 0.35, type: "spring", stiffness: 60 }}
              layout
            >
              <motion.div
                className={`rounded-lg px-4 py-2 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"}`}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {msg.content}
              </motion.div>
              {msg.code && (
                <motion.pre
                  className="mt-2 bg-zinc-900 text-xs text-purple-300 rounded p-2 overflow-x-auto max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {msg.code}
                </motion.pre>
              )}
              {msg.videoUrl && (
                <motion.div
                  className="mt-2 w-full max-w-md"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <video
                    src={msg.videoUrl}
                    controls
                    className="rounded-lg shadow-lg bg-black"
                    autoPlay
                    loop
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <motion.form
        onSubmit={handleSubmit}
        className="flex gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded bg-gray-800 text-slate-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Describe your animation idea..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-6 py-2 rounded bg-purple-600 hover:bg-purple-700 transition text-white font-semibold disabled:opacity-50"
          disabled={loading || !query.trim()}
        >
          {loading ? "Generating..." : "Send"}
        </button>
      </motion.form>
      {error && <motion.div className="text-red-400 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
    </motion.div>
  );
} 
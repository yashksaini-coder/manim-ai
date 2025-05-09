"use client";

import React, { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cleaner = (code: string) => {
    return code.replace(/```python/g, "").replace(/```/g, "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVideoUrl("");
    setCode("");
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
      setCode(cleanedCode);

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
      setVideoUrl(videoData.video_url);
    } catch (err) {
      setError("Failed to generate video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 text-slate-200">
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4 items-center">
        <input
          type="text"
          className="w-full px-4 py-2 rounded bg-stone-800 text-slate-200 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your query..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-2 rounded bg-purple-600 hover:bg-purple-700 transition text-white font-semibold disabled:opacity-50"
          disabled={loading || !query.trim()}
        >
          {loading ? "Generating..." : "Generate Video"}
        </button>
      </form>
      {error && <div className="text-red-400 mt-4">{error}</div>}
      {code && (
        <div className="mt-6 w-full max-w-xl bg-stone-900 rounded-lg p-4 text-xs text-left overflow-x-auto">
          <div className="mb-2 text-purple-400 font-bold">Generated Code:</div>
          <pre>{code}</pre>
        </div>
      )}
      <div className="mt-8 w-full max-w-xl flex flex-col items-center">
        {videoUrl && (
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg shadow-lg bg-black"
            autoPlay
            loop
          />
        )}
      </div>
    </div>
  );
}


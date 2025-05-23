"use client";

import { Download, ExternalLink, Play, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface VideoCardProps {
  videoUrl?: string;
  isLoading?: boolean;
}

export function VideoCard({ videoUrl, isLoading = false }: VideoCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 90 ? 1 : 0.5;
          return Math.min(prev + increment, 95); // Cap at 95% until actually loaded
        });
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedData = () => {
      setLoaded(true);
    };
    
    video.addEventListener('loadeddata', handleLoadedData);
    
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);
  
  const handleDownload = async () => {
    try {
      if (!videoUrl) return;
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `manim-animation-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-lg overflow-hidden"
    >
      <div className="relative">
        {/* Loading overlay - no AnimatePresence */}
        {(isLoading || !loaded) && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10"
          >
            {/* Loading animation */}
            <div className="mb-4 relative">
              <div className="w-12 h-12 rounded-full border-t-2 border-l-2 border-r-2 border-green-500 animate-spin"></div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 1.5 
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <RefreshCw className="h-6 w-6 text-green-500" />
              </motion.div>
            </div>
            
            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-stone-800 rounded-full overflow-hidden mb-2">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                style={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-xs text-stone-400">
              {isLoading ? "Generating animation..." : "Loading video..."}
            </div>
          </div>
        )}
        
        {/* Video */}
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full bg-black rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full aspect-video bg-black rounded-lg"></div>
        )}
        
        {/* Control overlay */}
        {videoUrl && (
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="h-8 w-8 rounded-full bg-[#0f0f0f] cursor-pointer hover:text-green-400 text-white flex items-center justify-center transition-all duration-200"
              aria-label="Download video"
            >
              <Download className="h-4 w-4" />
            </motion.button>
            
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-full bg-[#0f0f0f] cursor-pointer hover:text-green-400 text-white flex items-center justify-center transition-all duration-200"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </motion.a>
          </div>
        )}
      </div>
      
      {/* Empty state that shows when no video */}
      {!videoUrl && !isLoading && (
        <div className="flex flex-col items-center justify-center p-10 bg-black rounded-lg min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Play className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-lg text-stone-300 font-medium text-center">
            No animation loaded
          </p>
          <p className="text-sm text-stone-500 mt-3 text-center">
          </p>
        </div>
      )}
    </motion.div>
  );
} 
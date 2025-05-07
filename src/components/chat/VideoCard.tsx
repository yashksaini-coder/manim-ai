"use client";

import { Download, ExternalLink, Maximize2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoCardProps {
  videoUrl: string;
}

export function VideoCard({ videoUrl }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    
    const handleLoadedData = () => {
      setDuration(video.duration);
    };
    
    const handlePause = () => {
      setIsPaused(true);
    };
    
    const handlePlay = () => {
      setIsPaused(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, []);
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  
  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const video = videoRef.current;
    if (!progressBar || !video) return;
    
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };
  
  const handleDownload = async () => {
    try {
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="rounded-lg overflow-hidden border border-green-800/30 bg-[#1A202C] w-full max-w-[640px] shadow-xl relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="px-4 py-2 bg-green-900/20 flex justify-between items-center">
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
            className="w-3 h-3 rounded-full bg-green-500"
          ></motion.div>
        </motion.div>
        <motion.div 
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            className="text-gray-400 hover:text-white p-1 hover:bg-[#293040] rounded transition-all"
            title="Download video"
          >
            <Download size={16} />
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white p-1 hover:bg-[#293040] rounded transition-all"
            title="Open in new tab"
          >
            <ExternalLink size={16} />
          </motion.a>
        </motion.div>
      </div>
      
      <div className="relative bg-black group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-contain"
          autoPlay
          loop
          playsInline
        />
        
        {/* Video controls overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 flex flex-col justify-between p-4"
            >
              {/* Top controls */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-black/40 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/60 transition-colors"
                  onClick={() => {
                    // Full screen logic
                    videoRef.current?.requestFullscreen();
                  }}
                >
                  <Maximize2 size={16} />
                </motion.button>
              </div>
              
              {/* Center play/pause button */}
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <button
                  onClick={handlePlayPause}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white rounded-full p-4"
                >
                  {isPaused ? (
                    <Play size={20} fill="white" />
                  ) : (
                    <Pause size={20} />
                  )}
                </button>
              </motion.div>
              
              {/* Bottom controls */}
              <div className="space-y-2">
                {/* Progress bar */}
                <div 
                  ref={progressRef}
                  className="w-full h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <motion.div 
                    className="h-full bg-green-500"
                    style={{ width: `${progress}%` }}
                    layoutId="progress"
                  />
                </div>
                
                {/* Time and volume controls */}
                <div className="flex justify-between items-center">
                  <div className="text-white text-xs">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMuteToggle}
                    className="text-white hover:text-green-300 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Custom play button when video is paused and not hovered */}
        {isPaused && !isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={handlePlayPause}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white rounded-full p-4"
          >
            <Play size={20} fill="white" />
          </motion.button>
        )}
      </div>
      
      {/* Video details footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 py-2 bg-[#1A202C]/80 text-xs text-gray-400 flex justify-between items-center"
      >
        <span>Manim Animation</span>
        <span>{formatTime(duration)}</span>
      </motion.div>
      
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 -z-10 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 opacity-0 rounded-lg"
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
} 
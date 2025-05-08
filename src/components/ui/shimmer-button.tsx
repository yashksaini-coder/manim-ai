"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const ShimmerButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [spanHovered, setSpanHovered] = useState(false);
  const [coordX, setCoordX] = useState(0);
  const [coordY, setCoordY] = useState(0);

  // When hovering the button, set the x,y coordinates for the shimmer to follow the cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!spanHovered) return;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCoordX(x);
      setCoordY(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [spanHovered]);

  return (
    <motion.span
      className={cn(
        "relative inline-flex h-fit w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-800 bg-slate-900/30 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-800/50",
        className
      )}
      onHoverStart={() => setSpanHovered(true)}
      onHoverEnd={() => setSpanHovered(false)}
      onMouseLeave={() => {
        setCoordX(0);
        setCoordY(0);
      }}
    >
      <span className="relative z-10 flex items-center gap-1">{children}</span>
      {spanHovered && (
        <motion.span
          className="absolute inset-0 z-0"
          style={{
            background: `radial-gradient(circle at ${coordX}px ${coordY}px, rgba(120, 120, 120, 0.25) 0%, transparent 60%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.span>
  );
}; 
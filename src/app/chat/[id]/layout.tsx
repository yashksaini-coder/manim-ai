"use client";
import "../../globals.css";
import { ReactNode } from "react";

interface ChatLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default function ChatLayout({ children, params }: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#121212]">
      {/* Main Content with padding */}
      <div className="flex-1 overflow-hidden px-10 py-6 mt-20">
        <div className="h-full rounded-lg bg-[#121212] border border-white overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
} 
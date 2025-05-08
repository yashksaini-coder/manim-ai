"use client";
import "../../globals.css";
import { ReactNode } from "react";

interface ChatLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default function ChatLayout({ children, params }: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Main Content with fixed height and no overflow */}
      <div className="flex-1 h-[calc(100vh-80px)] overflow-hidden px-10 py-6 mt-20">
        <div className="h-full rounded-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
} 
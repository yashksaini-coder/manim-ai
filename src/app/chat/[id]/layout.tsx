"use client";
import "../../globals.css";
import { ReactNode } from "react";

interface ChatLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default function ChatLayout({ children, params }: ChatLayoutProps) {
  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden px-3">
      {children}
    </div>
  );
}

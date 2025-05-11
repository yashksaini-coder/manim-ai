import "../../globals.css";
import { ReactNode } from "react";

export default function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden px-3">
      {children}
    </div>
  );
} 
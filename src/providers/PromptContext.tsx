"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
interface PromptContextType {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState("");
  return (
    <PromptContext.Provider value={{ prompt, setPrompt }}>
      {children}
    </PromptContext.Provider>
  );
}

export function usePrompt() {
  const context = useContext(PromptContext);
  if (!context) throw new Error("usePrompt must be used within a PromptProvider");
  return context;
} 
"use client";

import { HeroSection } from "@/components/hero-section-9";
import { useSearchParams } from "next/navigation";

export default function MainPage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  return <HeroSection />;
}

  
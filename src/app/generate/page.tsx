"use client";
import AIChatInput from "@/components/LandingInput"

export default function Generate() {

    return (
        <div className="min-h-screen flex flex-col items-center bg-background pt-28 md:pt-32 px-4">
            <div className="w-full max-w-2xl mx-auto mb-8 text-center">
                <p className="text-muted-foreground mb-2 max-w-xl mx-auto">
                    Describe your animation idea and let our AI help you create stunning Manim animations instantly.
                </p>
            </div>
            <div className="w-full max-w-2xl mx-auto bg-white/90 dark:bg-zinc-900/80 rounded-2xl shadow-xl p-0 md:p-6 border border-zinc-200 dark:border-zinc-800">
                <AIChatInput />
            </div>
        </div>
    )
}
"use client";
import AIChatInput from "@/components/ui/ai-chat-input"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Generate() {
    const { isSignedIn, user } = useUser();

    return (
        <div className="min-h-screen flex flex-col items-center bg-background pt-28 md:pt-32 px-4">
            <div className="w-full max-w-2xl mx-auto mb-8 text-center">
                <div className="flex flex-col items-center gap-3 mb-4">
                    {isSignedIn ? (
                        <>  
                            <UserButton afterSignOutUrl="/" /><h2 className="text-xl font-semibold text-primary">Welcome, {user?.firstName || user?.username || "User"}!</h2>
                        </>
                    ) : (
                        <>
                            <SignInButton mode="modal">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign in to personalize your experience</Button>
                            </SignInButton>
                        </>
                    )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Animation Generator</h1>
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
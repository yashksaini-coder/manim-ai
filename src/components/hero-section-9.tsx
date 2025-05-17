import * as React from "react"
import { HoverPeek } from "./ui/link-preview"
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useState } from "react";
import { Loader2, Twitter, Github } from "lucide-react";
import { MainFooter } from "@/components/Footer";

export const HeroSection = () => {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const prompts = [
        "Create a simple animation of a bouncing ball.",
        "Transform blue square to a red circle.",
        "Area of a circle with radius 5.",
        "Linear interpolation between two points.",
        "Linear equation of a line passing through two points.",
    ]

    const handleInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = e.currentTarget.querySelector("input")?.value;
        if (value && value.trim()) {
            router.push(`/generate?prompt=${encodeURIComponent(value)}`);
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <main className="flex-1">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[50rem] -translate-y-50 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[50rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[50rem] -translate-y-50 absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                <section className="overflow-hidden bg-white dark:bg-transparent h-full">
                    <div className="relative mx-auto max-w-5xl px-6 h-full flex flex-col justify-center">
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <p className="mx-auto mb-8 max-w-2xl text-xl">
                                Create stunning animations with{' '}
                                <HoverPeek url="https://www.manim.community/">
                                    <a
                                        href="https://www.manim.community/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-blue-600 underline decoration-blue-400 decoration-dotted hover:text-blue-800 hover:decoration-blue-600 hover:decoration-solid"
                                    >
                                        Manim
                                    </a>
                                </HoverPeek>{' '}
                                the powerful open-source animation engine.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 justify-center relative">
                            {isRedirecting ? (
                                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                    <p className="text-sm text-stone-500">Preparing your animation workspace...</p>
                                </div>
                            ) : (
                                <div className="px-40">
                                    <PlaceholdersAndVanishInput
                                        placeholders={prompts}
                                        onChange={() => {}}
                                        onSubmit={handleInputSubmit}
                                    />
                                    <div className="flex justify-center gap-4 mt-6">
                                        <a
                                            href="https://x/yash_k_saini"
                                            target="_blank"
                                            aria-label="Twitter"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-secondary hover:bg-secondary/80 transition font-medium text-base gap-2"
                                        >
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                        <a
                                            href="https://github.com/yashksaini-coder"
                                            target="_blank"
                                            aria-label="GitHub"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-secondary hover:bg-secondary/80 transition font-medium text-base gap-2"
                                        >
                                            <Github className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            {/* <footer className="mt-auto">
                <MainFooter />
            </footer> */}
        </div>
    )
}

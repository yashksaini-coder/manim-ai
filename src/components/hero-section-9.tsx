import * as React from "react"
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { HoverPeek } from "./ui/link-preview"
import { DotPattern } from "@/components/ui/dot-pattern-1"
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import AIChatInput from "@/components/ai-chat-input";

export const HeroSection = () => {
    const { user } = useUser();
    const router = useRouter();

    const handleClick = () => {
        if (!user) {
            router.push('/sign-in?redirect_url=/generate');
        } else {
            // Generate a unique chat session id using uuid
            const chatId = uuid();
            router.push(`/generate/`);
        }
    };

    return (
        <div>
            <main>
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-87.5 absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                <section className="overflow-hidden bg-white dark:bg-transparent mt-10">
                    <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-24">
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <p className="mx-auto my-8 max-w-2xl text-xl">
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
                        {/* Centered AIChatInput below hero */}
                        <div className="flex mt-20 justify-center">
                            <AIChatInput />
                        </div>
                    </div>
                    {/* <div className="mx-auto mb-8 max-w-5xl px-6 md:mb-20 xl:px-0">
                        <div className="relative flex flex-col items-center border border-red-500">
                            <DotPattern width={5} height={5} />

                            <div className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-red-500 text-white" />
                            <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-red-500 text-white" />
                            <div className="absolute -right-1.5 -top-1.5 h-3 w-3 bg-red-500 text-white" />
                            <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-red-500 text-white" />

                            <div className="relative z-20 mx-auto max-w-7xl rounded-[40px] py-6 md:p-10 xl:py-20">
                                <p className="md:text-md text-xs text-red-500 lg:text-lg xl:text-2xl">
                                    I believe
                                </p>
                                <div className="text-2xl tracking-tighter md:text-5xl lg:text-7xl xl:text-8xl">
                                    <div className="flex gap-1 md:gap-2 lg:gap-3 xl:gap-4">
                                        <h1 className="font-semibold">"AI animation</h1>
                                        <p className="font-thin">should be</p>
                                    </div>
                                    <div className="flex gap-1 md:gap-2 lg:gap-3 xl:gap-4">
                                        <p className="font-thin">intuitive</p>
                                        <h1 className="font-semibold">and</h1>
                                        <p className="font-thin">moves</p>
                                    </div>
                                    <div className="flex gap-1 md:gap-2 lg:gap-3 xl:gap-4">
                                        <p className="font-thin">as fast as</p>
                                        <h1 className="font-semibold">your imagination..."</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </section>
            </main>
        </div>
    )
}



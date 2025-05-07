import * as React from "react"
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, UserIcon } from 'lucide-react'
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { SignUpButton } from "@clerk/nextjs"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { HoverPeek } from "./ui/link-preview"
import { DotPattern } from "@/components/ui/dot-pattern-1"
export const HeroSection = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const { isSignedIn } = useUser();

    return (
        <div>
            <header>
                <nav
                    data-state={menuState && 'active'}
                    className="group fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
                    <div className="m-auto max-w-5xl px-6">
                        <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                            {/* Logo */}
                            <div className="flex items-center space-x-2">
                                <Link href="/" aria-label="home" className="flex items-center space-x-2">
                                    <Logo />
                                </Link>
                            </div>

                            {/* Desktop Navigation */}

                            {/* Right side: Auth/Profile + ThemeToggle */}
                            <div className="hidden md:flex items-center gap-3">
                                <ThemeToggle />
                                {isSignedIn ? (
                                    <>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                                        >
                                            <Link href="/generate-roadmap">Get Started</Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-primary"
                                        >
                                            <Link href="/profile" className="flex items-center gap-1.5">
                                                <UserIcon className="h-4 w-4" />
                                                <span>Profile</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-primary"
                                        >
                                            <Link href="/guide">Guide</Link>
                                        </Button>
                                        <UserButton />
                                    </>
                                ) : (
                                    <>
                                        <SignInButton>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hover:text-primary"
                                            >
                                                Login
                                            </Button>
                                        </SignInButton>
                                        <SignUpButton>
                                            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                                Start free →
                                            </Button>
                                        </SignUpButton>
                                    </>
                                )}
                            </div>

                            {/* Mobile Navigation Trigger */}
                            <div className="md:hidden flex items-center gap-2">
                                <ThemeToggle />
                                {isSignedIn && <UserButton />}
                                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="md:hidden">
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                        <nav className="flex flex-col gap-4 mt-8">
                                            <div className="mt-4">
                                                <ThemeToggle />
                                            </div>
                                            <div className="mt-4 flex flex-col gap-2">
                                                {isSignedIn ? (
                                                    <>
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                                                        >
                                                            <Link href="/generate-roadmap" onClick={() => setIsOpen(false)}>
                                                                Get Started
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            className="justify-start text-muted-foreground hover:text-primary"
                                                        >
                                                            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-1.5">
                                                                <UserIcon className="h-4 w-4" />
                                                                <span>Profile</span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="justify-start text-muted-foreground hover:text-primary"
                                                        >
                                                            <Link href="/guide" onClick={() => setIsOpen(false)}>
                                                                Guide
                                                            </Link>
                                                        </Button>
                                                        <div className="mt-2">
                                                            <UserButton />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <SignInButton>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full text-muted-foreground hover:text-primary justify-start"
                                                            >
                                                                Login
                                                            </Button>
                                                        </SignInButton>
                                                        <SignUpButton>
                                                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                                                Start free →
                                                            </Button>
                                                        </SignUpButton>
                                                    </>
                                                )}
                                            </div>
                                        </nav>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <main>
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-87.5 absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                <section className="overflow-hidden bg-white dark:bg-transparent">
                    <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-24">
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">Manim Animation redefined</h1>
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

                            <Button
                                asChild
                                size="lg">
                                <Link href="/">
                                    <span className="btn-label">Start Building</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="mx-auto mb-10 max-w-7xl px-6 md:mb-20 xl:px-0">
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
                    </div>
                </section>
                <section className="bg-background relative z-10 py-16">
                    <div className="m-auto max-w-5xl px-6">
                        <h2 className="text-center text-lg font-medium">Your favorite companies are our partners.</h2>
                        <div className="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
                            <img
                                className="h-5 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                alt="Nvidia Logo"
                                height="20"
                                width="auto"
                            />
                            <img
                                className="h-4 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/column.svg"
                                alt="Column Logo"
                                height="16"
                                width="auto"
                            />
                            <img
                                className="h-4 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/github.svg"
                                alt="GitHub Logo"
                                height="16"
                                width="auto"
                            />
                            <img
                                className="h-5 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/nike.svg"
                                alt="Nike Logo"
                                height="20"
                                width="auto"
                            />
                            <img
                                className="h-4 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/laravel.svg"
                                alt="Laravel Logo"
                                height="16"
                                width="auto"
                            />
                            <img
                                className="h-7 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/lilly.svg"
                                alt="Lilly Logo"
                                height="28"
                                width="auto"
                            />
                            <img
                                className="h-5 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                                alt="Lemon Squeezy Logo"
                                height="20"
                                width="auto"
                            />
                            <img
                                className="h-6 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/openai.svg"
                                alt="OpenAI Logo"
                                height="24"
                                width="auto"
                            />
                            <img
                                className="h-4 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/tailwindcss.svg"
                                alt="Tailwind CSS Logo"
                                height="16"
                                width="auto"
                            />
                            <img
                                className="h-5 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/vercel.svg"
                                alt="Vercel Logo"
                                height="20"
                                width="auto"
                            />
                            <img
                                className="h-5 w-fit dark:invert"
                                src="https://html.tailus.io/blocks/customers/zapier.svg"
                                alt="Zapier Logo"
                                height="20"
                                width="auto"
                            />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}


export const Logo = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 78 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('h-5 w-auto', className)}>
            <path
                d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z"
                fill="url(#logo-gradient)"
            />
            <path
                d="M27.06 7.054V12.239C27.06 12.5903 27.1393 12.8453 27.298 13.004C27.468 13.1513 27.7513 13.225 28.148 13.225H29.338V14.84H27.808C26.9353 14.84 26.2667 14.636 25.802 14.228C25.3373 13.82 25.105 13.157 25.105 12.239V7.054H24V5.473H25.105V3.144H27.06V5.473H29.338V7.054H27.06ZM30.4782 10.114C30.4782 9.17333 30.6709 8.34033 31.0562 7.615C31.4529 6.88967 31.9855 6.32867 32.6542 5.932C33.3342 5.524 34.0822 5.32 34.8982 5.32C35.6349 5.32 36.2752 5.46733 36.8192 5.762C37.3745 6.04533 37.8165 6.40233 38.1452 6.833V5.473H40.1002V14.84H38.1452V13.446C37.8165 13.888 37.3689 14.2563 36.8022 14.551C36.2355 14.8457 35.5895 14.993 34.8642 14.993C34.0595 14.993 33.3229 14.789 32.6542 14.381C31.9855 13.9617 31.4529 13.3837 31.0562 12.647C30.6709 11.899 30.4782 11.0547 30.4782 10.114ZM38.1452 10.148C38.1452 9.502 38.0092 8.941 37.7372 8.465C37.4765 7.989 37.1309 7.62633 36.7002 7.377C36.2695 7.12767 35.8049 7.003 35.3062 7.003C34.8075 7.003 34.3429 7.12767 33.9122 7.377C33.4815 7.615 33.1302 7.972 32.8582 8.448C32.5975 8.91267 32.4672 9.468 32.4672 10.114C32.4672 10.76 32.5975 11.3267 32.8582 11.814C33.1302 12.3013 33.4815 12.6753 33.9122 12.936C34.3542 13.1853 34.8189 13.31 35.3062 13.31C35.8049 13.31 36.2695 13.1853 36.7002 12.936C37.1309 12.6867 37.4765 12.324 37.7372 11.848C38.0092 11.3607 38.1452 10.794 38.1452 10.148ZM43.6317 4.232C43.2803 4.232 42.9857 4.113 42.7477 3.875C42.5097 3.637 42.3907 3.34233 42.3907 2.991C42.3907 2.63967 42.5097 2.345 42.7477 2.107C42.9857 1.869 43.2803 1.75 43.6317 1.75C43.9717 1.75 44.2607 1.869 44.4987 2.107C44.7367 2.345 44.8557 2.63967 44.8557 2.991C44.8557 3.34233 44.7367 3.637 44.4987 3.875C44.2607 4.113 43.9717 4.232 43.6317 4.232ZM44.5837 5.473V14.84H42.6457V5.473H44.5837ZM49.0661 2.26V14.84H47.1281V2.26H49.0661ZM50.9645 10.114C50.9645 9.17333 51.1572 8.34033 51.5425 7.615C51.9392 6.88967 52.4719 6.32867 53.1405 5.932C53.8205 5.524 54.5685 5.32 55.3845 5.32C56.1212 5.32 56.7615 5.46733 57.3055 5.762C57.8609 6.04533 58.3029 6.40233 58.6315 6.833V5.473H60.5865V14.84H58.6315V13.446C58.3029 13.888 57.8552 14.2563 57.2885 14.551C56.7219 14.8457 56.0759 14.993 55.3505 14.993C54.5459 14.993 53.8092 14.789 53.1405 14.381C52.4719 13.9617 51.9392 13.3837 51.5425 12.647C51.1572 11.899 50.9645 11.0547 50.9645 10.114ZM58.6315 10.148C58.6315 9.502 58.4955 8.941 58.2235 8.465C57.9629 7.989 57.6172 7.62633 57.1865 7.377C56.7559 7.12767 56.2912 7.003 55.7925 7.003C55.2939 7.003 54.8292 7.12767 54.3985 7.377C53.9679 7.615 53.6165 7.972 53.3445 8.448C53.0839 8.91267 52.9535 9.468 52.9535 10.114C52.9535 10.76 53.0839 11.3267 53.3445 11.814C53.6165 12.3013 53.9679 12.6753 54.3985 12.936C54.8405 13.1853 55.3052 13.31 55.7925 13.31C56.2912 13.31 56.7559 13.1853 57.1865 12.936C57.6172 12.6867 57.9629 12.324 58.2235 11.848C58.4955 11.3607 58.6315 10.794 58.6315 10.148ZM65.07 6.833C65.3533 6.357 65.7273 5.98867 66.192 5.728C66.668 5.456 67.229 5.32 67.875 5.32V7.326H67.382C66.6227 7.326 66.0447 7.51867 65.648 7.904C65.2627 8.28933 65.07 8.958 65.07 9.91V14.84H63.132V5.473H65.07V6.833ZM73.3624 10.165L77.6804 14.84H75.0624L71.5944 10.811V14.84H69.6564V2.26H71.5944V9.57L74.9944 5.473H77.6804L73.3624 10.165Z"
                fill="currentColor"
            />
            <defs>
                <linearGradient
                    id="logo-gradient"
                    x1="10"
                    y1="0"
                    x2="10"
                    y2="20"
                    gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9B99FE" />
                    <stop
                        offset="1"
                        stopColor="#2BC8B7"
                    />
                </linearGradient>
            </defs>
        </svg>
    )
}
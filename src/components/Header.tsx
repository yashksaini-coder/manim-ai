import { SignInButton, useUser } from "@clerk/nextjs";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Link } from "lucide-react";
import React from "react";
import { ThemeToggle } from "./theme-toggle";
import { UserButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Video } from "lucide-react";
import Image from "next/image";

export const Header = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const { isSignedIn } = useUser();

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="group fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
                <div className="m-auto max-w-5xl px-6">
                    <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <Link href="/" aria-label="home" className="flex items-center space-x-2">
                                <Video className="h-6 w-6 text-primary" aria-label="Video" />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}

                        {/* Right side: Auth/Profile + ThemeToggle */}
                        <div className="hidden md:flex items-center gap-3">
                            <ThemeToggle />
                            {isSignedIn ? (
                                <>
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
    )
}
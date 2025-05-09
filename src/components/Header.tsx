"use client";

import * as React from "react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Menu, UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ThemeSwitcher } from "./theme-toggle";

export const Header = () => {
  const { isSignedIn } = useUser();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="">
      <div className="mx-auto max-w-[1400px] flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-medium">
            <span className="text-primary">Manim.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <ThemeSwitcher />
          {isSignedIn ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
              ></Button>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-stone-300 hover:text-white hover:bg-transparent"
                >
                  Login
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-stone-200 font-medium"
                >
                  Start free →
                </Button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* MOBILE NAVIGATION */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeSwitcher />
          {isSignedIn && <UserButton />}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-stone-300 hover:text-white hover:bg-transparent"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-black/90 border-stone-800"
            >
              <nav className="flex flex-col gap-4 mt-8">
                <div className="mt-4">
                  <ThemeSwitcher />
                </div>
                {isSignedIn ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                    >
                      <Link href="/generate" onClick={() => setIsOpen(false)}>
                        Start Animating
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start text-muted-foreground hover:text-primary"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-1.5"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <SignInButton>
                      <Button
                        variant="ghost"
                        className="w-full text-stone-300 hover:text-white hover:bg-transparent justify-start"
                      >
                        Login
                      </Button>
                    </SignInButton>

                    <SignUpButton>
                      <Button className="w-full bg-white text-black hover:bg-stone-200 font-medium">
                        Start free →
                      </Button>
                    </SignUpButton>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

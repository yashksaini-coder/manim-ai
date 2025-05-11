import { Button } from "@/components/ui/button"
import { Hexagon, Twitter, Github, Link } from "lucide-react"

export interface FooterProps {
  logo?: React.ReactNode
  brandName?: string
  socialLinks?: Array<{
    icon: React.ReactNode
    href: string
    label: string
  }>
  mainLinks?: Array<{
    href: string
    label: string
  }>
  legalLinks?: Array<{
    href: string
    label: string
  }>
  copyright?: {
    text: string
    license?: string
  }
}

// Default values
const defaultLogo = <Hexagon className="h-6 w-6" />
const defaultBrandName = "Manim AI"
const defaultSocialLinks = [
  {
    icon: <Twitter className="h-5 w-5" />,
    href: "https://twitter.com",
    label: "Twitter",
  },
  {
    icon: <Github className="h-5 w-5" />,
    href: "https://github.com",
    label: "GitHub",
  },
]
const defaultMainLinks = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/about",
    label: "About",
  },
]
const defaultLegalLinks = [
  {
    href: "/privacy",
    label: "Privacy Policy",
  },
  {
    href: "/terms",
    label: "Terms of Service",
  },
]
const defaultCopyright = {
  text: `© ${new Date().getFullYear()} Manim AI`,
  license: "All rights reserved",
}

export function Footer({
  logo = defaultLogo,
  brandName = defaultBrandName,
  socialLinks = defaultSocialLinks,
  mainLinks = defaultMainLinks,
  legalLinks = defaultLegalLinks,
  copyright = defaultCopyright,
}: FooterProps) {
  return (
    <footer className="pb-6 pt-16 lg:pb-8 lg:pt-24">
      <div className="px-4 lg:px-8">
        <div className="md:flex md:items-start md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-x-2"
            aria-label={brandName}
          >
            {logo}
            <span className="font-bold text-xl">{brandName}</span>
          </Link>
          {socialLinks.length > 0 && (
            <ul className="flex list-none mt-6 md:mt-0 space-x-3">
              {socialLinks.map((link, i) => (
                <li key={i}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    asChild
                  >
                    <a href={link.href} target="_blank" aria-label={link.label} rel="noopener noreferrer">
                      {link.icon}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          {mainLinks.length > 0 && (
            <nav className="lg:mt-0 lg:col-[4/11]">
              <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
                {mainLinks.map((link, i) => (
                  <li key={i} className="my-1 mx-2 shrink-0">
                    <a
                      href={link.href}
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {legalLinks.length > 0 && (
            <div className="mt-6 lg:mt-0 lg:col-[4/11]">
              <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
                {legalLinks.map((link, i) => (
                  <li key={i} className="my-1 mx-3 shrink-0">
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6 text-sm leading-6 text-muted-foreground whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
            {copyright && (
              <>
                <div>{copyright.text}</div>
                {copyright.license && <div>{copyright.license}</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

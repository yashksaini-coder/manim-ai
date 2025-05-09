import { Github, Twitter, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface MainFooterProps {
  className?: string
}

export const MainFooter = ({ className }: MainFooterProps = {}) => {
  return (
    <footer className={cn("pb-6 pt-8 lg:pb-8 lg:pt-12 w-full bg-background", className)}>
      <div className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="md:flex md:items-start md:justify-between">
          <a
            href="/"
            className="flex items-center gap-x-2"
            aria-label="Manim AI"
          >
            <Video className="h-8 w-8 text-white" />
            <span className="font-bold text-xl">Manim AI</span>
          </a>
          <ul className="flex list-none mt-6 md:mt-0 space-x-3">
            <li>
              <a
                href="https://x/yash_k_saini"
                target="_blank"
                aria-label="Twitter"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-secondary hover:bg-secondary/80 transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yashksaini-coder"
                target="_blank"
                aria-label="GitHub"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-secondary hover:bg-secondary/80 transition"
              >
                <Github className="h-5 w-5" />
              </a>
            </li>
          </ul>
        </div>
        <div className="border-t mt-6 pt-6 flex flex-col items-center">
          <div className="text-sm leading-6 text-muted-foreground text-center">
            <div>© {new Date().getFullYear()} Manim AI</div>
            <div>Built with <span role="img" aria-label="love">❤️</span> by AI enthusiasts</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

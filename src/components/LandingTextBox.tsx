"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function LandingTextBox() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);

    if (!isSignedIn) {
      // Redirect to sign-up if not signed in
      router.push(`/sign-up?redirect_url=/projects`);
      return;
    }

    try {
      // Create a new project and navigate to it
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "New Animation Project",
          description: "Created from landing page"
        })
      });
      
      if (response.ok) {
        const project = await response.json();
        
        // Create a prompt in the project
        const promptResponse = await fetch(`/api/projects/${project.id}/prompts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: prompt,
            type: "USER"
          })
        });
        
        if (promptResponse.ok) {
          const promptData = await promptResponse.json();
          router.push(`/projects/${project.id}/prompts/${promptData.id}`);
        } else {
          router.push(`/projects/${project.id}`);
        }
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const placeholders = [
    "A circle morphing into a square in 3D space...",
    "Create an animation showing harmonic oscillations...",
    "Visualize the double pendulum with colorful trails...",
    "An animation demonstrating wave interference pattern...",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col space-y-2 p-8">
          <motion.div variants={childVariants} className="flex items-center space-x-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-gray-700"></div>
            <p className="text-gray-400 text-sm">What would you like to animate?</p>
          </motion.div>

          <motion.textarea
            variants={childVariants}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
            className="w-full h-20 bg-transparent text-gray-200 text-sm focus:outline-none resize-none placeholder:text-gray-600"
            disabled={isLoading}
          />

          <motion.div variants={childVariants} className="flex justify-end">
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className={`flex items-center gap-1 text-sm px-4 py-2 rounded-md transition-all ${
                !prompt.trim() || isLoading
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin mr-1"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Animation</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
} 
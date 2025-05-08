"use client";

import { ArrowRight, Bot, Check, ChevronDown, Paperclip } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const OPENAI_SVG = (
    <div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="256"
            height="260"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 256 260"
            aria-label="o3-mini icon"
            className="dark:hidden block"
        >
            <title>OpenAI Icon Light</title>
            <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
        </svg>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="256"
            height="260"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 256 260"
            aria-label="o3-mini icon"
            className="hidden dark:block"
        >
            <title>OpenAI Icon Dark</title>
            <path
                fill="#fff"
                d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
            />
        </svg>
    </div>
);

const GROQ_SVG = (
    <div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201"><path fill="#F54F35" d="M0 0h201v201H0V0Z" /><path fill="#FEFBFB" d="m128 49 1.895 1.52C136.336 56.288 140.602 64.49 142 73c.097 1.823.148 3.648.161 5.474l.03 3.247.012 3.482.017 3.613c.01 2.522.016 5.044.02 7.565.01 3.84.041 7.68.072 11.521.007 2.455.012 4.91.016 7.364l.038 3.457c-.033 11.717-3.373 21.83-11.475 30.547-4.552 4.23-9.148 7.372-14.891 9.73l-2.387 1.055c-9.275 3.355-20.3 2.397-29.379-1.13-5.016-2.38-9.156-5.17-13.234-8.925 3.678-4.526 7.41-8.394 12-12l3.063 2.375c5.572 3.958 11.135 5.211 17.937 4.625 6.96-1.384 12.455-4.502 17-10 4.174-6.784 4.59-12.222 4.531-20.094l.012-3.473c.003-2.414-.005-4.827-.022-7.241-.02-3.68 0-7.36.026-11.04-.003-2.353-.008-4.705-.016-7.058l.025-3.312c-.098-7.996-1.732-13.21-6.681-19.47-6.786-5.458-13.105-8.211-21.914-7.792-7.327 1.188-13.278 4.7-17.777 10.601C75.472 72.012 73.86 78.07 75 85c2.191 7.547 5.019 13.948 12 18 5.848 3.061 10.892 3.523 17.438 3.688l2.794.103c2.256.082 4.512.147 6.768.209v16c-16.682.673-29.615.654-42.852-10.848-8.28-8.296-13.338-19.55-13.71-31.277.394-9.87 3.93-17.894 9.562-25.875l1.688-2.563C84.698 35.563 110.05 34.436 128 49Z" /></svg>
    </div>
);

export default function AI_Prompt({prompt, onSend, isDisabled}: {
    prompt: string;
    onSend?: (message: string) => void;
    isDisabled?: boolean;
}) {
    const [value, setValue] = useState(prompt || "");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    });
    const [selectedModel, setSelectedModel] = useState("gemma-2-9b-it");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [code, setCode] = useState("");
    const [query, setQuery] = useState("");

    // Use useEffect to set the initial value when prompt changes
    useEffect(() => {
        if (prompt) {
            setValue(prompt);
            // Adjust height after setting value
            setTimeout(adjustHeight, 0);
        }
    }, [prompt, adjustHeight]);

    const AI_MODELS = [
        "llama-3.1-70b-versatile",
        "llama-3.1-8b-instant",
        "gemma-2-9b-it",
        // "o3-mini",
        // "Gemini 2.5 Flash",
        // "Claude 3.5 Sonnet",
        // "GPT-4-1 Mini",
        // "GPT-4-1",
    ];

    const MODEL_ICONS: Record<string, React.ReactNode> = {
        "llama-3.1-70b-versatile": GROQ_SVG,
        "llama-3.1-8b-instant": GROQ_SVG,
        "gemma-2-9b-it": GROQ_SVG,
        "o3-mini": OPENAI_SVG,
        "Gemini 2.5 Flash": (
            <svg
                height="1em"
                style={{ flex: "none", lineHeight: "1" }}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Gemini</title>
                <defs>
                    <linearGradient
                        id="lobe-icons-gemini-fill"
                        x1="0%"
                        x2="68.73%"
                        y1="100%"
                        y2="30.395%"
                    >
                        <stop offset="0%" stopColor="#1C7DFF" />
                        <stop offset="52.021%" stopColor="#1C69FF" />
                        <stop offset="100%" stopColor="#F0DCD6" />
                    </linearGradient>
                </defs>
                <path
                    d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
                    fill="url(#lobe-icons-gemini-fill)"
                    fillRule="nonzero"
                />
            </svg>
        ),
        "Claude 3.5 Sonnet": (
            <div>
                <svg
                    fill="#000"
                    fillRule="evenodd"
                    style={{ flex: "none", lineHeight: "1" }}
                    viewBox="0 0 24 24"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    className="dark:hidden block"
                >
                    <title>Anthropic Icon Light</title>
                    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
                </svg>
                <svg
                    fill="#ffff"
                    fillRule="evenodd"
                    style={{ flex: "none", lineHeight: "1" }}
                    viewBox="0 0 24 24"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    className="hidden dark:block"
                >
                    <title>Anthropic Icon Dark</title>
                    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
                </svg>
            </div>
        ),
        "GPT-4-1 Mini": OPENAI_SVG,
        "GPT-4-1": OPENAI_SVG,
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmitPrompt();
        }
    };

    const cleaner = (code: string) => {
        return code.replace(/```python/g, "").replace(/```/g, "");
    };

    const handleSubmitPrompt = async () => {
        if (!value.trim()) return;

        // If onSend prop is provided, use it instead of default behavior
        if (onSend) {
            onSend(value);
            setValue(""); // Clear input after sending
            return;
        }

        setIsLoading(true);
        // Generate a unique chat ID
        const chatId = uuidv4();

        setError("");
        setVideoUrl("");
        setCode("");
        setQuery(value); // Save the query value

        try {
            // Animate to show processing
            // 1. Generate code from query
            const codeRes = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/generate/code`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: value, // Use the current value instead of query
                        model: selectedModel,
                    }),
                }
            );
            const codeData = await codeRes.json();
            const cleanedCode = cleaner(codeData.code);
            console.log(cleanedCode);
            setCode(cleanedCode);

            // 2. Generate video from cleaned code
            const videoRes = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/render/video`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code: cleanedCode,
                        file_name: "GenScene.py",
                        file_class: "GenScene",
                        iteration: Math.floor(Math.random() * 1000000),
                        project_name: "GenScene",
                    }),
                }
            );
            const videoData = await videoRes.json();
            setVideoUrl(videoData.video_url);
        } catch (err) {
            setError("Failed to generate video. Please try again.");
        } finally {
            setIsLoading(false);
        }

        // Redirect to the chat page with the prompt as a query parameter
        router.push(`/chat/${chatId}`);
    };

    return (
        <div className="w-full">
            <div className="bg-black/5 dark:bg-[#222] rounded-xl">
                <div className="relative">
                    <div className="relative flex flex-col">
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: "120px" }}
                        >
                            <Textarea
                                id="ai-input-15"
                                value={value}
                                placeholder={"What animation would you like to create?"}
                                className={cn(
                                    "w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-[#222] border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-gray-400 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "min-h-[52px] text-sm"
                                )}
                                ref={textareaRef}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                disabled={isLoading || isDisabled}
                            />
                        </div>

                        <div className="h-12 bg-black/5 dark:bg-[#222] rounded-b-xl flex items-center border-t border-[#232323]/20">
                            <div className="absolute left-3 right-3 bottom-2 flex items-center justify-between w-[calc(100%-24px)]">
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex items-center gap-1 h-7 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-pink-500"
                                                disabled={isLoading || isDisabled}
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={selectedModel}
                                                        initial={{
                                                            opacity: 0,
                                                            y: -5,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 5,
                                                        }}
                                                        transition={{
                                                            duration: 0.15,
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {
                                                            MODEL_ICONS[
                                                            selectedModel
                                                            ]
                                                        }
                                                        <span className="max-w-[80px] truncate">{selectedModel}</span>
                                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className={cn(
                                                "min-w-[10rem]",
                                                "border-black/10 dark:border-white/10",
                                                "bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950"
                                            )}
                                        >
                                            {AI_MODELS.map((model) => (
                                                <DropdownMenuItem
                                                    key={model}
                                                    onSelect={() =>
                                                        setSelectedModel(model)
                                                    }
                                                    className="flex items-center justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {MODEL_ICONS[model] || (
                                                            <Bot className="w-4 h-4 opacity-50" />
                                                        )}
                                                        <span>{model}</span>
                                                    </div>
                                                    {selectedModel ===
                                                        model && (
                                                            <Check className="w-4 h-4 text-pink-500" />
                                                        )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <div className="h-4 w-px bg-black/10 dark:bg-[#333] mx-0.5" />
                                    <label
                                        className={cn(
                                            "rounded-lg p-1.5 bg-black/5 dark:bg-[#222] cursor-pointer",
                                            "hover:bg-black/10 dark:hover:bg-[#2a2a2a] focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-pink-500",
                                            "text-black/40 dark:text-gray-400 hover:text-black dark:hover:text-white",
                                            (isLoading || isDisabled) && "opacity-50 pointer-events-none"
                                        )}
                                        aria-label="Attach file"
                                    >
                                        <input type="file" className="hidden" disabled={isLoading || isDisabled} />
                                        <Paperclip className="w-3.5 h-3.5 transition-colors" />
                                    </label>
                                </div>
                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="rounded-lg p-1.5 bg-pink-500 text-white"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ 
                                                    duration: 1, 
                                                    repeat: Infinity, 
                                                    ease: "linear" 
                                                }}
                                                className="w-3.5 h-3.5"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                                                    <circle 
                                                        cx="12" 
                                                        cy="12" 
                                                        r="10" 
                                                        stroke="currentColor" 
                                                        strokeWidth="4" 
                                                        strokeOpacity="0.25" 
                                                    />
                                                    <path 
                                                        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22" 
                                                        stroke="currentColor" 
                                                        strokeWidth="4" 
                                                        strokeLinecap="round" 
                                                    />
                                                </svg>
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            key="send"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            type="button"
                                            className={cn(
                                                "rounded-lg p-1.5",
                                                value.trim() 
                                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                                                    : "bg-black/5 dark:bg-[#222]",
                                                "hover:bg-pink-600 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-pink-500 transition-colors"
                                            )}
                                            aria-label="Send message"
                                            disabled={!value.trim() || isLoading || isDisabled}
                                            onClick={handleSubmitPrompt}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <ArrowRight
                                                className={cn(
                                                    "w-3.5 h-3.5 transition-opacity duration-200",
                                                    value.trim() && !isLoading && !isDisabled
                                                        ? "opacity-100"
                                                        : "opacity-30"
                                                )}
                                            />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs"
                >
                    {error}
                </motion.div>
            )}
        </div>
    );
}

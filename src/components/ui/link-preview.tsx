"use client";

// Bringing in the essentials: Radix for the hover card, qss for URL params, React, Framer Motion for animations, and our utility function.
import * as RdxHoverCard from "@radix-ui/react-hover-card";
import { encode } from "qss";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

// A little helper hook to figure out the image source, whether it's static or needs fetching from Microlink.
function usePreviewSource(
    url: string,
    width: number,
    height: number,
    quality: number, // Microlink might ignore this for screenshots, but it's here if needed.
    isStatic: boolean,
    staticImageSrc?: string
) {
    return useMemo(() => {
        if (isStatic) {
            return staticImageSrc || ""; // Just use the provided static image.
        }
        // Build the Microlink URL if we need a dynamic screenshot.
        const params = encode({
            url,
            screenshot: true,
            meta: false,
            embed: "screenshot.url",
            colorScheme: "dark", // Looks good in dark mode.
            "viewport.isMobile": true,
            "viewport.deviceScaleFactor": 1,
            "viewport.width": width * 2.5, // Grabbing a higher-res image than displayed for zooming.
            "viewport.height": height * 2.5,
        });
        return `https://api.microlink.io/?${params}`;
    }, [isStatic, staticImageSrc, url, width, height, quality]); // Recalculate only if these change.
}

// This hook handles the hover card's open state and the subtle mouse-following effect for the card itself.
function useHoverState(followMouse: boolean) {
    const [isPeeking, setPeeking] = useState(false); // Is the card currently visible?
    const mouseX = useMotionValue(0); // Raw mouse position (relative to the trigger).
    const springConfig = { stiffness: 120, damping: 20 }; // Smooth spring physics for the follow effect.
    const followX = useSpring(mouseX, springConfig); // Smoothed value that the card's position will use.

    // Tracks the mouse pointer only when the follow effect is enabled.
    const handlePointerMove = useCallback(
        (event: React.PointerEvent<HTMLElement>) => {
            if (!followMouse) return;
            const target = event.currentTarget;
            const targetRect = target.getBoundingClientRect();
            // Calculate horizontal offset from the center of the trigger element.
            const eventOffsetX = event.clientX - targetRect.left;
            const offsetFromCenter = (eventOffsetX - targetRect.width / 2) * 0.3; // Multiplier softens the follow effect.
            mouseX.set(offsetFromCenter);
        },
        [mouseX, followMouse] // Effect dependencies.
    );

    // Updates our state when Radix tells us the hover card opened or closed.
    const handleOpenChange = useCallback((open: boolean) => {
        setPeeking(open);
        if (!open) {
            mouseX.set(0); // Reset the follow position when the card closes.
        }
    }, [mouseX]); // Effect dependency.

    return { isPeeking, handleOpenChange, handlePointerMove, followX };
}

// Defining what properties our HoverPeek component accepts.
type HoverPeekProps = {
    children: React.ReactNode; // What the user actually hovers over (e.g., a link).
    url: string; // The URL for the preview image or the link destination.
    className?: string; // Optional styling for the trigger element.
    peekWidth?: number; // How wide the preview card should be.
    peekHeight?: number; // How tall the preview card should be.
    imageQuality?: number; // Image quality parameter (mainly for potential non-Microlink use).
    enableMouseFollow?: boolean; // Should the card subtly follow the mouse?
    enableLensEffect?: boolean; // Should the magnifying lens appear on hover?
    lensZoomFactor?: number; // How much should the lens magnify?
    lensSize?: number; // How big should the lens circle be?
} & ( // This part ensures you provide 'imageSrc' if 'isStatic' is true.
        | { isStatic: true; imageSrc: string }
        | { isStatic?: false; imageSrc?: never }
    );


// --- Here's the main component: HoverPeek ---
// It wraps children with a hover trigger that shows a preview card, optionally with a lens effect.
export const HoverPeek = ({
    children,
    url,
    className,
    peekWidth = 200,
    peekHeight = 125,
    imageQuality = 50,
    isStatic = false,
    imageSrc = "",
    enableMouseFollow = true,
    enableLensEffect = true, // Lens is on by default.
    lensZoomFactor = 1.75, // A nice default zoom level.
    lensSize = 100, // Default lens diameter in pixels.
}: HoverPeekProps) => {

    // State to track if the preview image failed to load.
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    // Get the actual image URL using our custom hook.
    const finalImageSrc = usePreviewSource(
        url, peekWidth, peekHeight, imageQuality, isStatic, imageSrc
    );
    // Get card visibility state and mouse follow handlers from our other hook.
    const { isPeeking, handleOpenChange, handlePointerMove, followX } = useHoverState(enableMouseFollow);

    // State specifically for the lens effect.
    const [isHoveringLens, setIsHoveringLens] = useState(false); // Is the mouse currently over the preview image area?
    const [lensMousePosition, setLensMousePosition] = useState({ x: 0, y: 0 }); // Mouse coords relative to the image.

    // Little cleanup effects: Reset error if source changes, and reset everything if card closes.
    useEffect(() => {
        setImageLoadFailed(false);
    }, [finalImageSrc]);
    useEffect(() => {
        if (!isPeeking) {
            setImageLoadFailed(false);
            setIsHoveringLens(false); // Important to reset lens state when card hides.
        }
    }, [isPeeking]);

    // Handlers for mouse events *within* the preview image area to control the lens.
    const handleLensMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!enableLensEffect) return; // Only track if lens is enabled.
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate mouse position relative to the top-left of the image container (the <a> tag).
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setLensMousePosition({ x, y });
    };
    const handleLensMouseEnter = () => {
        if (enableLensEffect) setIsHoveringLens(true);
    };
    const handleLensMouseLeave = () => {
        if (enableLensEffect) setIsHoveringLens(false);
    };


    // Defines how the main preview card animates in and out (a little 3D flip).
    const cardMotionVariants = {
        initial: { opacity: 0, rotateY: -90, transition: { duration: 0.15 } },
        animate: { opacity: 1, rotateY: 0, transition: { type: "spring", stiffness: 200, damping: 18 } },
        exit: { opacity: 0, rotateY: 90, transition: { duration: 0.15 } },
    };

    // Defines how the lens overlay animates.
    const lensMotionVariants = {
        initial: { opacity: 0, scale: 0.7 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.7, transition: { duration: 0.2, ease: "easeIn" } },
    };

    // Prepare the trigger element. We use React.cloneElement to pass down props (like className and mouse handlers)
    // correctly, especially when the child might already have its own className.
    const triggerChild = React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            className: cn((children.props as any).className, className), // Merge classes nicely.
            onPointerMove: handlePointerMove, // Attach the card's follow handler.
        })
        : <span className={className} onPointerMove={handlePointerMove}>{children}</span>; // Fallback if children isn't a valid element.


    return (
        // The main Radix Hover Card component.
        <RdxHoverCard.Root
            openDelay={75} // How long to wait before showing the card.
            closeDelay={150} // How long to wait before hiding after mouse leaves.
            onOpenChange={handleOpenChange} // Connects Radix state to our hook.
        >
            {/* The element the user actually hovers over. 'asChild' merges props onto our prepared triggerChild. */}
            <RdxHoverCard.Trigger asChild>
                {triggerChild}
            </RdxHoverCard.Trigger>

            {/* Portal ensures the card floats above other content correctly. */}
            <RdxHoverCard.Portal>
                {/* The content container for the card. */}
                <RdxHoverCard.Content
                    // We need perspective for the 3D rotation effect to look right. Origin set to center for the flip.
                    className="[perspective:800px] [--radix-hover-card-content-transform-origin:center_center] z-50"
                    side="top" // Position card above the trigger.
                    align="center" // Align center horizontally.
                    sideOffset={12} // A little gap between trigger and card.
                    // This is a bit tricky: if the lens is on, we disable pointer events on the *wrapper*
                    // so that hover events are only detected on the link/image inside it for the lens effect.
                    style={{ pointerEvents: enableLensEffect ? 'none' : 'auto' }}
                >
                    {/* AnimatePresence handles the mount/unmount animations. */}
                    <AnimatePresence>
                        {/* Only render the card content if 'isPeeking' is true. */}
                        {isPeeking && (
                            // The animated div for the card itself (handles the flip and mouse follow).
                            <motion.div
                                variants={cardMotionVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                style={{
                                    x: enableMouseFollow ? followX : 0, // Apply the smoothed mouse follow position.
                                    pointerEvents: 'auto' // Make sure this container *can* receive pointer events.
                                }}
                            >
                                {/* The link wrapping the preview image. It also acts as the lens trigger area. */}
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "relative block overflow-hidden rounded-lg bg-white dark:bg-neutral-900", // Relative positioning is key for the absolute lens layer.
                                        "border border-neutral-200 dark:border-neutral-700",
                                        "shadow-lg hover:shadow-xl transition-shadow",
                                        "p-0.5" // Tiny padding creates a nice inner border effect.
                                    )}
                                    // Attach lens handlers here.
                                    onMouseEnter={handleLensMouseEnter}
                                    onMouseLeave={handleLensMouseLeave}
                                    onMouseMove={handleLensMouseMove}
                                >
                                    {/* Display either the loaded image or a fallback if loading failed. */}
                                    {imageLoadFailed ? (
                                        <div
                                            className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-sans"
                                            style={{ width: peekWidth, height: peekHeight }}
                                        >
                                            Preview unavailable
                                        </div>
                                    ) : (
                                        // The base preview image.
                                        <img
                                            src={finalImageSrc}
                                            width={peekWidth}
                                            height={peekHeight}
                                            // align-top helps prevent tiny gaps sometimes seen below images. pointer-events-none ensures clicks go to the link.
                                            className="block rounded-[5px] pointer-events-none bg-neutral-50 dark:bg-neutral-800 align-top"
                                            alt={`Link preview for ${url}`}
                                            onError={() => setImageLoadFailed(true)} // Uh oh, image didn't load.
                                            loading="lazy" // Let the browser optimize loading.
                                        />
                                    )}

                                    {/* --- Magnifying Lens Layer --- */}
                                    {/* This only appears if the lens is enabled, the user is hovering over the link, and the image hasn't failed. */}
                                    <AnimatePresence>
                                        {enableLensEffect && isHoveringLens && !imageLoadFailed && (
                                            // The lens container itself.
                                            <motion.div
                                                // Absolute positioning places it over the base image. pointer-events-none lets mouse events pass through to the link below.
                                                className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
                                                variants={lensMotionVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                style={{
                                                    // This is the magic: Use a radial gradient as a mask to create the circular lens shape.
                                                    // The sharp transition (black radius px, transparent radius px) gives us a clear edge.
                                                    maskImage: `radial-gradient(circle ${lensSize / 2}px at ${lensMousePosition.x}px ${lensMousePosition.y}px, black ${lensSize / 2}px, transparent ${lensSize / 2}px)`,
                                                    WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${lensMousePosition.x}px ${lensMousePosition.y}px, black ${lensSize / 2}px, transparent ${lensSize / 2}px)`,
                                                }}
                                            >
                                                {/* Inside the masked area, this div holds the scaled-up image. */}
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        // Scale up the image based on the zoom factor.
                                                        transform: `scale(${lensZoomFactor})`,
                                                        // Crucially, set the transform origin to the mouse position, so the correct part of the image is magnified.
                                                        transformOrigin: `${lensMousePosition.x}px ${lensMousePosition.y}px`,
                                                    }}
                                                >
                                                    {/* The magnified image itself - needs the same source and dimensions as the base image. */}
                                                    <img
                                                        src={finalImageSrc}
                                                        width={peekWidth}
                                                        height={peekHeight}
                                                        className="block rounded-[5px] bg-neutral-50 dark:bg-neutral-800 align-top" // Match base image styles.
                                                        alt="" // Decorative, alt text is on the base image.
                                                        aria-hidden="true" // Hide from screen readers.
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </RdxHoverCard.Content>
            </RdxHoverCard.Portal>
        </RdxHoverCard.Root>
    );
};
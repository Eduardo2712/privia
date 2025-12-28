"use client";

import { useState, useRef } from "react";

interface Props {
    readonly children: React.ReactNode;
    readonly content: string;
    readonly position?: "top" | "bottom" | "left" | "right";
    readonly delay?: number;
}

export default function CustomTooltip({ children, content, position = "top", delay = 200 }: Props) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tooltipId = `tooltip-${Math.random().toString(36).substring(2, 11)}`;

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(true);
    };

    const handleHideWithDelay = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => setIsVisible(false), delay);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsVisible(false);
        }
    };

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-[rgba(12,15,22,0.95)]",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[rgba(12,15,22,0.95)]",
        left: "left-full top-1/2 -translate-y-1/2 border-l-[rgba(12,15,22,0.95)]",
        right: "right-full top-1/2 -translate-y-1/2 border-r-[rgba(12,15,22,0.95)]",
    };

    return (
        <button
            type="button"
            className="group relative inline-flex items-center p-0 bg-transparent border-none cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-md"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleHideWithDelay}
            onFocus={handleMouseEnter}
            onBlur={handleHideWithDelay}
            onKeyDown={handleKeyDown}
            aria-describedby={isVisible ? tooltipId : undefined}
            aria-haspopup="true"
            aria-expanded={isVisible}
        >
            {children}

            {isVisible && (
                <div
                    id={tooltipId}
                    className={`
                        absolute z-50 px-3.5 py-3 text-sm leading-relaxed font-medium
                        text-gray-100 bg-[#0c0f16]/90 border border-white/10 rounded-xl backdrop-blur-xl
                        shadow-[0_18px_50px_-28px_rgba(59,130,246,0.55),0_12px_36px_-30px_rgba(147,51,234,0.45)]
                        transition-all duration-200 ease-out
                        block w-max max-w-sm max-h-64 overflow-y-auto custom-scrollbar wrap-break-word whitespace-pre-line
                        ${positionClasses[position]}
                    `}
                    role="tooltip"
                    aria-hidden={!isVisible}
                >
                    <span
                        className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-br from-blue-500/15 via-purple-500/8 to-blue-500/12 blur-2xl"
                        aria-hidden="true"
                    />
                    {content}
                    <div
                        className={`
                            absolute w-0 h-0 border-4 border-transparent
                            ${arrowClasses[position]}
                        `}
                        aria-hidden="true"
                    />
                </div>
            )}
        </button>
    );
}

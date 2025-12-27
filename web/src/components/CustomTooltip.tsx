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

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, delay);
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
        top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900",
        left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900",
        right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900",
    };

    return (
        <button
            className="relative inline-block bg-transparent border-none cursor-pointer p-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
            aria-describedby={isVisible ? tooltipId : undefined}
        >
            {children}

            {isVisible && (
                <div
                    id={tooltipId}
                    className={`
                        absolute z-50 px-3 py-2 text-sm font-medium 
                        text-white bg-gray-900 rounded-lg shadow-lg
                        transition-opacity duration-200
                        block w-max max-w-sm max-h-64 overflow-y-auto wrap-break-word
                        ${positionClasses[position]}
                    `}
                    role="tooltip"
                    aria-hidden={!isVisible}
                >
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

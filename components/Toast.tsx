"use client";

import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface ToastData {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
}

interface ToastProps {
    toasts: ToastData[];
    removeToast: (id: string) => void;
}

const TOAST_DURATION = 5000;
const SWIPE_THRESHOLD = 100;

export default function Toast({ toasts, removeToast }: ToastProps) {
    return (
        <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-3 max-w-[320px]">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({
    toast,
    onRemove,
}: {
    toast: ToastData;
    onRemove: () => void;
}) {
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);
    const shouldRemoveRef = useRef(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - 100 / (TOAST_DURATION / 10);
                if (newProgress <= 0) {
                    shouldRemoveRef.current = true;
                    return 0;
                }
                return newProgress;
            });
        }, 10);

        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        if (shouldRemoveRef.current) {
            onRemove();
        }
    }, [progress, onRemove]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
            onRemove();
        }
    };

    const config = {
        success: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M9 12l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
            ),
            color: "text-green-500",
            progressColor: "bg-green-500",
        },
        error: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M15 9l-6 6M9 9l6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            ),
            color: "text-red-500",
            progressColor: "bg-red-500",
        },
        info: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M12 8v4M12 16h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            ),
            color: "text-blue-500",
            progressColor: "bg-blue-500",
        },
        warning: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 9v4M12 17h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ),
            color: "text-yellow-500",
            progressColor: "bg-yellow-500",
        },
    }[toast.type];

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start gap-3 p-4">
                <div className={`shrink-0 ${config.color}`}>{config.icon}</div>

                <p className="flex-1 text-sm text-gray-800 dark:text-gray-100 font-medium leading-snug select-none">
                    {toast.message}
                </p>

                <button
                    onClick={onRemove}
                    className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Fermer"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-100 dark:bg-gray-700">
                <div
                    className={`h-full ${config.progressColor} transition-none`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </motion.div>
    );
}

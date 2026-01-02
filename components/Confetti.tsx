"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiProps {
    show: boolean;
}

export default function Confetti({ show }: ConfettiProps) {
    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        if (show) {
            setParticles(Array.from({ length: 50 }, (_, i) => i));
        } else {
            setParticles([]);
        }
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {particles.map((i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: -20,
                                rotate: 0,
                                scale: Math.random() * 0.5 + 0.5,
                            }}
                            animate={{
                                y: window.innerHeight + 20,
                                rotate: Math.random() * 720 - 360,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: Math.random() * 2 + 2,
                                ease: "linear",
                            }}
                            className="absolute w-3 h-3 rounded-sm"
                            style={{
                                backgroundColor: [
                                    "#f43f5e",
                                    "#8b5cf6",
                                    "#3b82f6",
                                    "#10b981",
                                    "#f59e0b",
                                ][Math.floor(Math.random() * 5)],
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}

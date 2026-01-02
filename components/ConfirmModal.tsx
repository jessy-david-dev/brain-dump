"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: "red" | "green" | "blue";
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    confirmColor = "red",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const colorClasses = {
        red: "bg-red-500 hover:bg-red-600",
        green: "bg-green-500 hover:bg-green-600",
        blue: "bg-blue-500 hover:bg-blue-600",
    }[confirmColor];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-white mb-2">
                            {title}
                        </h3>
                        <p className="text-gray-400 mb-6">{message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 ${colorClasses} text-white font-semibold py-3 px-4 rounded-xl transition-colors`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

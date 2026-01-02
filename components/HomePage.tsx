"use client";

import { motion } from "framer-motion";

interface HomePageProps {
    onStartNormal: () => void;
    onStartCrisis: () => void;
    onOpenKanban: () => void;
    onOpenDashboard: () => void;
    isAdmin?: boolean;
}

export default function HomePage({
    onStartNormal,
    onStartCrisis,
    onOpenKanban,
    onOpenDashboard,
    isAdmin = false,
}: HomePageProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md w-full"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="text-7xl mb-6"
                >
                    🧠
                </motion.div>

                <h1 className="text-4xl font-bold text-white mb-2">
                    Brain Dump
                </h1>
                <br />

                <div className="space-y-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartNormal}
                        className="cursor-pointer w-full bg-linear-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200"
                    >
                        🌿 Commencer doucement
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartCrisis}
                        className="cursor-pointer w-full bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200"
                    >
                        🆘 Je ne vais pas bien !
                    </motion.button>

                    <div className="flex gap-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onOpenKanban}
                            className={`cursor-pointer ${
                                isAdmin ? "flex-1" : "w-full"
                            } bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors`}
                        >
                            📋 Kanban
                        </motion.button>

                        {isAdmin && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onOpenDashboard}
                                className="cursor-pointer flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                            >
                                ⚙️ Questions
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

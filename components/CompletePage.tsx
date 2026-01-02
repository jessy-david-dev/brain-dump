"use client";

import { QuestionMode, SessionAnswer } from "@/types";
import { motion } from "framer-motion";

interface CompletePageProps {
    answers: SessionAnswer[];
    mode: QuestionMode;
    onGoHome: () => void;
    onGoToKanban: () => void;
    onExport: () => void;
}

export default function CompletePage({
    answers,
    mode,
    onGoHome,
    onGoToKanban,
    onExport,
}: CompletePageProps) {
    const answeredCount = answers.filter((a) => a.answer.trim()).length;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md w-full"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
                    className="text-7xl mb-6"
                >
                    {mode === "crisis" ? "💪" : "✨"}
                </motion.div>

                <h1 className="text-3xl font-bold text-white mb-2">
                    {mode === "crisis"
                        ? "Tu as fait le plus dur"
                        : "Session terminée !"}
                </h1>

                <p className="text-gray-400 mb-8">
                    {answeredCount} réponse{answeredCount > 1 ? "s" : ""}{" "}
                    enregistrée
                    {answeredCount > 1 ? "s" : ""}
                </p>

                <div className="space-y-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onExport}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        📥 Exporter en Markdown
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onGoToKanban}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        📋 Voir le Kanban
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onGoHome}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        🏠 Retour à l&apos;accueil
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

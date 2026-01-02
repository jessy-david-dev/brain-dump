"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="text-8xl mb-6"
                >
                    🤔
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400 mb-8">
                    Cette page n&apos;existe pas
                </p>
                <Link href="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                    >
                        Retour à l&apos;accueil
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
}

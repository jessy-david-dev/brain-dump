"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-red-500/30"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="text-6xl mb-4"
                    >
                        🚫
                    </motion.div>
                    <h1 className="text-3xl font-bold text-red-400 mb-2">
                        Accès Refusé
                    </h1>
                    <p className="text-gray-400 mb-4">
                        Vous n&apos;êtes pas autorisé à accéder à cette
                        application.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Cette application est réservée aux utilisateurs
                        autorisés uniquement.
                    </p>
                </div>

                <Link href="/login">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                        Réessayer avec un autre compte
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
}

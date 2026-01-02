"use client";

import { Question, QuestionMode } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface QuestionsDashboardProps {
    onBack: () => void;
}

const NORMAL_CATEGORIES = [
    "Brain",
    "Émotions",
    "Corps",
    "Actions",
    "Relations",
    "Sécurité",
    "Créativité",
    "Clôture",
];

const CRISIS_CATEGORIES = [
    "Sécurité",
    "Ancrage",
    "Besoins",
    "Émotions",
    "Respiration",
    "Pensées",
    "Soutien",
    "Action",
    "Ressources",
    "Récupération",
];

export default function QuestionsDashboard({
    onBack,
}: QuestionsDashboardProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMode, setActiveMode] = useState<QuestionMode>("normal");
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(
        null
    );
    const [isAdding, setIsAdding] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        category: "",
        question: "",
    });
    const [customCategory, setCustomCategory] = useState("");

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch("/api/questions");
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = async () => {
        const category =
            newQuestion.category === "__custom__"
                ? customCategory
                : newQuestion.category;

        if (!category.trim() || !newQuestion.question.trim()) return;

        try {
            const response = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category,
                    question: newQuestion.question,
                    mode: activeMode,
                }),
            });

            if (response.ok) {
                const created = await response.json();
                setQuestions([...questions, created]);
                setNewQuestion({ category: "", question: "" });
                setCustomCategory("");
                setIsAdding(false);
            }
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };

    const updateQuestion = async () => {
        if (!editingQuestion) return;

        try {
            const response = await fetch("/api/questions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingQuestion.id,
                    category: editingQuestion.category,
                    question: editingQuestion.question,
                }),
            });

            if (response.ok) {
                const updated = await response.json();
                setQuestions(
                    questions.map((q) => (q.id === updated.id ? updated : q))
                );
                setEditingQuestion(null);
            }
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };

    const deleteQuestion = async (id: number) => {
        if (!confirm("Supprimer cette question ?")) return;

        try {
            const response = await fetch(`/api/questions?id=${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setQuestions(questions.filter((q) => q.id !== id));
            }
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const moveQuestion = async (id: number, direction: "up" | "down") => {
        const modeQuestions = questions.filter((q) => q.mode === activeMode);
        const index = modeQuestions.findIndex((q) => q.id === id);

        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === modeQuestions.length - 1) return;

        const swapIndex = direction === "up" ? index - 1 : index + 1;
        const currentQuestion = modeQuestions[index];
        const swapQuestion = modeQuestions[swapIndex];

        try {
            await fetch("/api/questions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: currentQuestion.id,
                    order_index: swapQuestion.order_index,
                }),
            });

            await fetch("/api/questions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: swapQuestion.id,
                    order_index: currentQuestion.order_index,
                }),
            });

            fetchQuestions();
        } catch (error) {
            console.error("Error moving question:", error);
        }
    };

    const filteredQuestions = questions.filter((q) => q.mode === activeMode);
    const categories =
        activeMode === "normal" ? NORMAL_CATEGORIES : CRISIS_CATEGORIES;

    const groupedQuestions = filteredQuestions.reduce((acc, q) => {
        if (!acc[q.category]) acc[q.category] = [];
        acc[q.category].push(q);
        return acc;
    }, {} as Record<string, Question[]>);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors"
                    >
                        ← Retour
                    </motion.button>

                    <h1 className="text-3xl md:text-4xl font-bold">
                        ⚙️ Gestion des Questions
                    </h1>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAdding(true)}
                        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl transition-colors"
                    >
                        + Ajouter
                    </motion.button>
                </div>

                <div className="flex gap-4 mb-8 justify-center">
                    <button
                        onClick={() => setActiveMode("normal")}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${
                            activeMode === "normal"
                                ? "bg-green-500 text-white"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        🌿 Normal (
                        {questions.filter((q) => q.mode === "normal").length})
                    </button>
                    <button
                        onClick={() => setActiveMode("crisis")}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${
                            activeMode === "crisis"
                                ? "bg-red-500 text-white"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        🆘 Crise (
                        {questions.filter((q) => q.mode === "crisis").length})
                    </button>
                </div>

                <div className="space-y-6">
                    {Object.entries(groupedQuestions).map(
                        ([category, categoryQuestions]) => (
                            <div
                                key={category}
                                className="bg-gray-800 rounded-2xl p-6"
                            >
                                <h2 className="text-xl font-bold mb-4 text-gray-300">
                                    {category} ({categoryQuestions.length})
                                </h2>

                                <div className="space-y-3">
                                    {categoryQuestions.map((q, idx) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gray-700 rounded-xl p-4 flex items-center gap-4"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() =>
                                                        moveQuestion(
                                                            q.id!,
                                                            "up"
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-white text-sm"
                                                    disabled={idx === 0}
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        moveQuestion(
                                                            q.id!,
                                                            "down"
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-white text-sm"
                                                    disabled={
                                                        idx ===
                                                        categoryQuestions.length -
                                                            1
                                                    }
                                                >
                                                    ▼
                                                </button>
                                            </div>

                                            <p className="flex-1 text-white">
                                                {q.question}
                                            </p>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        setEditingQuestion(q)
                                                    }
                                                    className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
                                                >
                                                    ✏️ Modifier
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteQuestion(q.id!)
                                                    }
                                                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                                                >
                                                    🗑️ Supprimer
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    )}

                    {filteredQuestions.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-xl mb-4">
                                Aucune question pour ce mode
                            </p>
                            <p>
                                Clique sur "+ Ajouter" pour créer ta première
                                question
                            </p>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                            onClick={() => setIsAdding(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg"
                            >
                                <h2 className="text-2xl font-bold mb-4">
                                    Nouvelle Question
                                </h2>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-2">
                                        Mode :
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setActiveMode("normal")
                                            }
                                            className={`flex-1 py-2 rounded-xl ${
                                                activeMode === "normal"
                                                    ? "bg-green-500"
                                                    : "bg-gray-700"
                                            }`}
                                        >
                                            🌿 Normal
                                        </button>
                                        <button
                                            onClick={() =>
                                                setActiveMode("crisis")
                                            }
                                            className={`flex-1 py-2 rounded-xl ${
                                                activeMode === "crisis"
                                                    ? "bg-red-500"
                                                    : "bg-gray-700"
                                            }`}
                                        >
                                            🆘 Crise
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-2">
                                        Catégorie :
                                    </p>
                                    <select
                                        value={newQuestion.category}
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                category: e.target.value,
                                            })
                                        }
                                        className="w-full bg-gray-700 text-white p-3 rounded-xl outline-none"
                                    >
                                        <option value="">
                                            Sélectionner une catégorie
                                        </option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                        <option value="__custom__">
                                            + Nouvelle catégorie
                                        </option>
                                    </select>

                                    {newQuestion.category === "__custom__" && (
                                        <input
                                            type="text"
                                            value={customCategory}
                                            onChange={(e) =>
                                                setCustomCategory(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nom de la nouvelle catégorie"
                                            className="w-full bg-gray-700 text-white p-3 rounded-xl outline-none mt-2"
                                        />
                                    )}
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-2">
                                        Question :
                                    </p>
                                    <textarea
                                        value={newQuestion.question}
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                question: e.target.value,
                                            })
                                        }
                                        placeholder="Écris ta question ici..."
                                        className="w-full bg-gray-700 text-white p-3 rounded-xl outline-none resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={addQuestion}
                                        className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-xl font-bold"
                                    >
                                        Ajouter
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAdding(false);
                                            setNewQuestion({
                                                category: "",
                                                question: "",
                                            });
                                            setCustomCategory("");
                                        }}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-xl"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {editingQuestion && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                            onClick={() => setEditingQuestion(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg"
                            >
                                <h2 className="text-2xl font-bold mb-4">
                                    Modifier la Question
                                </h2>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-2">
                                        Catégorie :
                                    </p>
                                    <input
                                        type="text"
                                        value={editingQuestion.category}
                                        onChange={(e) =>
                                            setEditingQuestion({
                                                ...editingQuestion,
                                                category: e.target.value,
                                            })
                                        }
                                        className="w-full bg-gray-700 text-white p-3 rounded-xl outline-none"
                                    />
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-2">
                                        Question :
                                    </p>
                                    <textarea
                                        value={editingQuestion.question}
                                        onChange={(e) =>
                                            setEditingQuestion({
                                                ...editingQuestion,
                                                question: e.target.value,
                                            })
                                        }
                                        className="w-full bg-gray-700 text-white p-3 rounded-xl outline-none resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={updateQuestion}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded-xl font-bold"
                                    >
                                        Sauvegarder
                                    </button>
                                    <button
                                        onClick={() => setEditingQuestion(null)}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-xl"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

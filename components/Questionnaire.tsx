"use client";

import { CATEGORIES } from "@/lib/constants";
import { Question, TaskCategory } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface QuestionnaireProps {
    questions: Question[];
    mode: "normal" | "crisis";
    onComplete: (
        answers: Array<{
            questionIndex: number;
            category: string;
            question: string;
            answer: string;
        }>
    ) => void;
    onBack: () => void;
    onAddTask?: (text: string, category: TaskCategory) => Promise<void>;
}

interface KanbanSelection {
    [questionIndex: number]: TaskCategory[];
}

export default function Questionnaire({
    questions,
    mode,
    onComplete,
    onBack,
    onAddTask,
}: QuestionnaireProps) {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<string[]>(
        new Array(questions.length).fill("")
    );
    const [direction, setDirection] = useState(1);
    const [kanbanSelections, setKanbanSelections] = useState<KanbanSelection>(
        {}
    );
    const [addingToKanban, setAddingToKanban] = useState<{
        [key: string]: boolean;
    }>({});
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, [currentQ]);

    const handleNext = () => {
        if (currentQ < questions.length - 1) {
            setDirection(1);
            setCurrentQ(currentQ + 1);
        } else {
            const formattedAnswers = answers
                .map((answer, index) => ({
                    questionIndex: index,
                    category: questions[index].category,
                    question: questions[index].question,
                    answer,
                }))
                .filter((a) => a.answer.trim());

            onComplete(formattedAnswers);
        }
    };

    const handlePrev = () => {
        if (currentQ > 0) {
            setDirection(-1);
            setCurrentQ(currentQ - 1);
        }
    };

    const handleAnswer = (value: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQ] = value;
        setAnswers(newAnswers);
    };

    const toggleKanbanCategory = async (category: TaskCategory) => {
        if (!answers[currentQ].trim()) return;

        const currentSelections = kanbanSelections[currentQ] || [];
        const isSelected = currentSelections.includes(category);

        if (isSelected) {
            setKanbanSelections({
                ...kanbanSelections,
                [currentQ]: currentSelections.filter((c) => c !== category),
            });
        } else {
            const key = `${currentQ}-${category}`;
            setAddingToKanban({ ...addingToKanban, [key]: true });

            try {
                if (onAddTask) {
                    await onAddTask(answers[currentQ], category);
                }
                setKanbanSelections({
                    ...kanbanSelections,
                    [currentQ]: [...currentSelections, category],
                });
            } catch (error) {
                console.error("Error adding task:", error);
            } finally {
                setAddingToKanban({ ...addingToKanban, [key]: false });
            }
        }
    };

    const isKanbanSelected = (category: TaskCategory) => {
        return (kanbanSelections[currentQ] || []).includes(category);
    };

    const progress = ((currentQ + 1) / questions.length) * 100;
    const currentQuestion = questions[currentQ];
    const hasAnswer = answers[currentQ].trim().length > 0;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            <div className="max-w-3xl w-full">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                            Question {currentQ + 1} / {questions.length}
                        </span>
                        <span className="text-sm text-gray-400">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                            className={
                                mode === "crisis"
                                    ? "h-full bg-red-500"
                                    : "h-full bg-green-500"
                            }
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentQ}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-800 rounded-3xl p-8 shadow-2xl"
                    >
                        <div className="mb-4">
                            <span
                                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                                    mode === "crisis"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-green-500/20 text-green-400"
                                }`}
                            >
                                {currentQuestion.category}
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                            {currentQuestion.question}
                        </h2>

                        <textarea
                            ref={textareaRef}
                            value={answers[currentQ]}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="Écris ta réponse ici..."
                            className="w-full bg-gray-700 text-white p-4 rounded-xl outline-none resize-none min-h-37.5 focus:ring-2 focus:ring-blue-500 transition-all"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.ctrlKey) {
                                    handleNext();
                                }
                            }}
                        />

                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-2">
                                Ajouter au kanban (optionnel) :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => {
                                    const isSelected = isKanbanSelected(
                                        cat.key
                                    );
                                    const isLoading =
                                        addingToKanban[
                                            `${currentQ}-${cat.key}`
                                        ];

                                    return (
                                        <motion.button
                                            key={cat.key}
                                            whileHover={{
                                                scale: hasAnswer ? 1.05 : 1,
                                            }}
                                            whileTap={{
                                                scale: hasAnswer ? 0.95 : 1,
                                            }}
                                            onClick={() =>
                                                toggleKanbanCategory(cat.key)
                                            }
                                            disabled={!hasAnswer || isLoading}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                                                !hasAnswer
                                                    ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                                                    : isSelected
                                                    ? `${cat.color} text-white`
                                                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                            }`}
                                        >
                                            {isLoading ? (
                                                <span className="animate-spin">
                                                    ⏳
                                                </span>
                                            ) : (
                                                <span>
                                                    [{isSelected ? "X" : " "}]
                                                </span>
                                            )}
                                            {cat.label}
                                        </motion.button>
                                    );
                                })}
                            </div>
                            {(kanbanSelections[currentQ]?.length ?? 0) > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-green-400 mt-2"
                                >
                                    ✓ Ajouté au kanban dans :{" "}
                                    {kanbanSelections[currentQ]
                                        .map(
                                            (k) =>
                                                CATEGORIES.find(
                                                    (c) => c.key === k
                                                )?.label
                                        )
                                        .join(", ")}
                                </motion.p>
                            )}
                        </div>

                        <div className="mt-4 text-sm text-gray-400">
                            💡 Appuie sur Ctrl+Entrée pour continuer
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-8 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={currentQ === 0 ? onBack : handlePrev}
                        className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors font-medium"
                    >
                        {currentQ === 0 ? "← Annuler" : "← Précédent"}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className={`px-6 py-3 rounded-xl transition-colors font-medium ${
                            mode === "crisis"
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        {currentQ === questions.length - 1
                            ? "✓ Terminer"
                            : "Suivant →"}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

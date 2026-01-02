"use client";

import CompletePage from "@/components/CompletePage";
import Confetti from "@/components/Confetti";
import HomePage from "@/components/HomePage";
import KanbanBoard from "@/components/KanbanBoard";
import Questionnaire from "@/components/Questionnaire";
import QuestionsDashboard from "@/components/QuestionsDashboard";
import { CRISIS_QUESTIONS, NORMAL_QUESTIONS } from "@/lib/constants";
import { Question, QuestionMode, SessionAnswer, TaskCategory } from "@/types";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Screen = "home" | "questions" | "complete" | "kanban" | "dashboard";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [screen, setScreen] = useState<Screen>("home");
    const [mode, setMode] = useState<QuestionMode>("normal");
    const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [dbQuestions, setDbQuestions] = useState<Question[]>([]);
    const [questionsLoaded, setQuestionsLoaded] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;

        const loadQuestions = async () => {
            try {
                const response = await fetch("/api/questions");
                const data = await response.json();
                setDbQuestions(data);
            } catch (error) {
                console.error("Error loading questions:", error);
            } finally {
                setQuestionsLoaded(true);
            }
        };
        loadQuestions();
    }, [status]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (screen === "questions") {
                    if (confirm("Abandonner le questionnaire ?")) {
                        setScreen("home");
                    }
                } else if (screen !== "home") {
                    setScreen("home");
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [screen]);

    const startQuestionnaire = (crisisMode: boolean) => {
        setMode(crisisMode ? "crisis" : "normal");
        setScreen("questions");
    };

    const handleAddTask = async (text: string, category: TaskCategory) => {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, category }),
        });

        if (!response.ok) {
            throw new Error("Failed to add task");
        }
    };

    const handleQuestionnaireComplete = async (answers: SessionAnswer[]) => {
        setSessionAnswers(answers);

        try {
            await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode, answers }),
            });
        } catch (error) {
            console.error("Error saving session:", error);
        }

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        setScreen("complete");
    };

    const exportSession = () => {
        const now = new Date();
        const date = now.toISOString().split("T")[0]; // 2026-01-02
        const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // 23-24-21
        const modeLabel = mode === "crisis" ? "crise" : "normal";
        const filename = `${date}_${time}_dump_${modeLabel}.md`;

        const modeEmoji = mode === "crisis" ? "🆘" : "🌿";

        let markdown = `# ${modeEmoji} Brain Dump - ${
            mode === "crisis" ? "CRISE" : "NORMAL"
        }\n\n`;
        markdown += `📅 **Date:** ${now.toLocaleString("fr-FR")}\n\n`;

        sessionAnswers.forEach((answer) => {
            if (answer.answer.trim()) {
                markdown += `## ${answer.category}\n**Q:** ${answer.question}\n**R:** ${answer.answer}\n\n`;
            }
        });

        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getQuestions = (questionMode: QuestionMode) => {
        const modeQuestions = dbQuestions.filter(
            (q) => q.mode === questionMode
        );
        if (modeQuestions.length > 0) {
            return modeQuestions;
        }
        return questionMode === "crisis" ? CRISIS_QUESTIONS : NORMAL_QUESTIONS;
    };

    const questions = getQuestions(mode);

    const handleDashboardBack = async () => {
        try {
            const response = await fetch("/api/questions");
            const data = await response.json();
            setDbQuestions(data);
        } catch (error) {
            console.error("Error reloading questions:", error);
        }
        setScreen("home");
    };

    return (
        <>
            {status === "loading" && (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {status === "authenticated" && (
                <>
                    <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
                            {session?.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt="Avatar"
                                    className="w-6 h-6 rounded-full"
                                />
                            )}
                            <span className="text-sm text-gray-300">
                                {session?.user?.name}
                            </span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors border border-red-500/30"
                        >
                            Déconnexion
                        </button>
                    </div>

                    <Confetti show={showConfetti} />

                    {screen === "home" && (
                        <HomePage
                            onStartNormal={() => startQuestionnaire(false)}
                            onStartCrisis={() => startQuestionnaire(true)}
                            onOpenKanban={() => setScreen("kanban")}
                            onOpenDashboard={() => setScreen("dashboard")}
                            isAdmin={session?.user?.isAdmin}
                        />
                    )}

                    {screen === "questions" && (
                        <Questionnaire
                            questions={questions}
                            mode={mode}
                            onComplete={handleQuestionnaireComplete}
                            onBack={() => setScreen("home")}
                            onAddTask={handleAddTask}
                        />
                    )}

                    {screen === "complete" && (
                        <CompletePage
                            answers={sessionAnswers}
                            mode={mode}
                            onGoHome={() => setScreen("home")}
                            onGoToKanban={() => setScreen("kanban")}
                            onExport={exportSession}
                        />
                    )}

                    {screen === "kanban" && (
                        <KanbanBoard onBack={() => setScreen("home")} />
                    )}

                    {screen === "dashboard" && (
                        <QuestionsDashboard onBack={handleDashboardBack} />
                    )}
                </>
            )}
        </>
    );
}

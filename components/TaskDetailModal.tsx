"use client";

import { CATEGORIES, STATUSES } from "@/lib/constants";
import { ChecklistItem, Task, TaskCategory, TaskStatus } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
    onUpdate: (task: Task) => void;
    onDelete: (taskId: number) => void;
    onComplete: (taskId: number) => void;
}

export default function TaskDetailModal({
    task,
    onClose,
    onUpdate,
    onDelete,
    onComplete,
}: TaskDetailModalProps) {
    const [title, setTitle] = useState(task.text);
    const [description, setDescription] = useState(task.description || "");
    const [checklist, setChecklist] = useState<ChecklistItem[]>(
        task.checklist || []
    );
    const [newItemText, setNewItemText] = useState("");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [saving, setSaving] = useState(false);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const cat = CATEGORIES.find((c) => c.key === task.category);

    const autoSave = useCallback(
        async (updates: Partial<Task>) => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(async () => {
                setSaving(true);
                try {
                    const response = await fetch("/api/tasks", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: task.id, ...updates }),
                    });

                    if (response.ok) {
                        const updatedTask = await response.json();
                        onUpdate(updatedTask);
                    }
                } catch (error) {
                    console.error("Error saving:", error);
                } finally {
                    setSaving(false);
                }
            }, 500);
        },
        [task.id, onUpdate]
    );

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        if (newTitle.trim()) {
            autoSave({ text: newTitle });
        }
    };

    const handleDescriptionChange = (newDescription: string) => {
        setDescription(newDescription);
        autoSave({ description: newDescription });
    };

    const addChecklistItem = () => {
        if (!newItemText.trim()) return;

        const newItem: ChecklistItem = {
            id: Date.now().toString(),
            text: newItemText,
            checked: false,
        };

        const newChecklist = [...checklist, newItem];
        setChecklist(newChecklist);
        setNewItemText("");
        autoSave({ checklist: newChecklist });
    };

    const toggleChecklistItem = (itemId: string) => {
        const newChecklist = checklist.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        setChecklist(newChecklist);
        autoSave({ checklist: newChecklist });
    };

    const deleteChecklistItem = (itemId: string) => {
        const newChecklist = checklist.filter((item) => item.id !== itemId);
        setChecklist(newChecklist);
        autoSave({ checklist: newChecklist });
    };

    const updateChecklistItemText = (itemId: string, newText: string) => {
        const newChecklist = checklist.map((item) =>
            item.id === itemId ? { ...item, text: newText } : item
        );
        setChecklist(newChecklist);
        autoSave({ checklist: newChecklist });
    };

    const handleCategoryChange = async (newCategory: TaskCategory) => {
        try {
            const response = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: task.id, category: newCategory }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                onUpdate(updatedTask);
            }
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };

    const handleStatusChange = async (newStatus: TaskStatus) => {
        try {
            const response = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: task.id, status: newStatus }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                onUpdate(updatedTask);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        if (isEditingDescription && descriptionRef.current) {
            descriptionRef.current.focus();
        }
    }, [isEditingDescription]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const completedCount = checklist.filter((item) => item.checked).length;
    const progressPercent =
        checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden"
            >
                <div
                    className={`${cat?.color} p-4 flex justify-between items-start`}
                >
                    <div className="flex-1">
                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={title}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                        setIsEditingTitle(false);
                                    if (e.key === "Escape") {
                                        setTitle(task.text);
                                        setIsEditingTitle(false);
                                    }
                                }}
                                className="w-full bg-white/20 text-white text-xl font-bold px-3 py-2 rounded-lg outline-none"
                            />
                        ) : (
                            <h2
                                onClick={() => setIsEditingTitle(true)}
                                className="text-xl font-bold text-white cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg transition"
                            >
                                {title}
                            </h2>
                        )}
                        <p className="text-white/70 text-sm mt-1 px-3">
                            dans {cat?.label} • {task.added}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white text-2xl p-2"
                    >
                        ✕
                    </button>
                </div>

                {saving && (
                    <div className="bg-blue-500/20 text-blue-400 text-sm px-4 py-2 flex items-center gap-2">
                        <span className="animate-spin">⏳</span>{" "}
                        Enregistrement...
                    </div>
                )}

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                            Statut
                        </h3>
                        <div className="flex gap-2">
                            {STATUSES.map((status) => (
                                <button
                                    key={status.key}
                                    onClick={() =>
                                        handleStatusChange(status.key)
                                    }
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                                        task.status === status.key
                                            ? `${status.color} text-white`
                                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    }`}
                                >
                                    {status.key === "done" ? "✓ " : ""}
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                            Catégorie
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category.key}
                                    onClick={() =>
                                        handleCategoryChange(category.key)
                                    }
                                    className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                                        task.category === category.key
                                            ? `${category.color} text-white`
                                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                            📝 Description
                        </h3>
                        {isEditingDescription ? (
                            <textarea
                                ref={descriptionRef}
                                value={description}
                                onChange={(e) =>
                                    handleDescriptionChange(e.target.value)
                                }
                                onBlur={() => setIsEditingDescription(false)}
                                placeholder="Ajoute une description plus détaillée..."
                                className="w-full bg-gray-700 text-white p-4 rounded-xl outline-none resize-none min-h-30 focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingDescription(true)}
                                className={`w-full bg-gray-700 p-4 rounded-xl cursor-pointer hover:bg-gray-600 transition min-h-20 ${
                                    description ? "text-white" : "text-gray-500"
                                }`}
                            >
                                {description ||
                                    "Ajoute une description plus détaillée..."}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-400">
                                ☑️ Checklist
                            </h3>
                            {checklist.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    {completedCount}/{checklist.length}
                                </span>
                            )}
                        </div>

                        {checklist.length > 0 && (
                            <div className="h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                        )}

                        <div className="space-y-2 mb-4">
                            <AnimatePresence>
                                {checklist.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center gap-3 group"
                                    >
                                        <button
                                            onClick={() =>
                                                toggleChecklistItem(item.id)
                                            }
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                                item.checked
                                                    ? "bg-green-500 border-green-500 text-white"
                                                    : "border-gray-500 hover:border-gray-400"
                                            }`}
                                        >
                                            {item.checked && "✓"}
                                        </button>
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) =>
                                                updateChecklistItemText(
                                                    item.id,
                                                    e.target.value
                                                )
                                            }
                                            className={`flex-1 bg-transparent outline-none ${
                                                item.checked
                                                    ? "text-gray-500 line-through"
                                                    : "text-white"
                                            }`}
                                        />
                                        <button
                                            onClick={() =>
                                                deleteChecklistItem(item.id)
                                            }
                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addChecklistItem();
                                }}
                                placeholder="Ajouter un élément..."
                                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={addChecklistItem}
                                disabled={!newItemText.trim()}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                        {task.status !== "done" &&
                            task.status !== "archived" && (
                                <button
                                    onClick={async () => {
                                        await handleStatusChange("done");
                                        onClose();
                                    }}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition"
                                >
                                    ✓ Terminer
                                </button>
                            )}
                        {task.status === "done" && (
                            <button
                                onClick={() => {
                                    onComplete(task.id);
                                    onClose();
                                }}
                                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition"
                            >
                                📦 Archiver
                            </button>
                        )}
                        {task.status === "done" && (
                            <button
                                onClick={async () => {
                                    await handleStatusChange("todo");
                                    onClose();
                                }}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition"
                            >
                                ↩️ Réouvrir
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onDelete(task.id);
                                onClose();
                            }}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-xl font-bold transition"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

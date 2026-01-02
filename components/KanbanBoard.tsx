"use client";

import { CATEGORIES, STATUSES } from "@/lib/constants";
import { KanbanView, Task, TaskCategory, TaskStatus } from "@/types";
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import Confetti from "./Confetti";
import ConfirmModal from "./ConfirmModal";
import TaskDetailModal from "./TaskDetailModal";
import Toast, { ToastData } from "./Toast";

interface KanbanBoardProps {
    onBack: () => void;
}

export default function KanbanBoard({ onBack }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [view, setView] = useState<KanbanView>("category");
    const [addingTask, setAddingTask] = useState(false);
    const [newTask, setNewTask] = useState({
        text: "",
        category: "urgent" as TaskCategory,
    });
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [originalTask, setOriginalTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

    const addToast = useCallback(
        (message: string, type: ToastData["type"] = "success") => {
            const id = Date.now().toString();
            setToasts((prev) => [...prev, { id, message, type }]);
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch("/api/tasks");
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        if (!newTask.text.trim()) return;

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });

            if (response.ok) {
                const createdTask = await response.json();
                setTasks([createdTask, ...tasks]);
                setNewTask({ text: "", category: "urgent" });
                setAddingTask(false);
                addToast("Tâche créée", "success");
            }
        } catch (error) {
            console.error("Error adding task:", error);
            addToast("Erreur lors de la création", "error");
        }
    };

    const updateTaskStatus = async (taskId: number, status: TaskStatus) => {
        try {
            const response = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const updateTaskCategory = async (
        taskId: number,
        category: TaskCategory
    ) => {
        console.log("updateTaskCategory called:", { taskId, category });
        try {
            const response = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, category }),
            });

            console.log("Response status:", response.status);

            if (response.ok) {
                const updatedTask = await response.json();
                console.log("Updated task:", updatedTask);
                setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
            } else {
                const error = await response.json();
                console.error("API Error:", error);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const completeAndArchiveTask = async (taskId: number) => {
        try {
            const response = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status: "archived" }),
            });

            if (response.ok) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
                const updatedTask = await response.json();
                setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
                addToast("Tâche archivée 🎉", "success");
            }
        } catch (error) {
            console.error("Error archiving task:", error);
            addToast("Erreur lors de l'archivage", "error");
        }
    };

    const restoreTask = async (taskId: number) => {
        try {
            const response = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status: "todo" }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
                addToast("Tâche restaurée", "info");
            }
        } catch (error) {
            console.error("Error restoring task:", error);
            addToast("Erreur lors de la restauration", "error");
        }
    };

    const deleteTask = async (taskId: number) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer la tâche",
            message:
                "Es-tu sûr de vouloir supprimer cette tâche ? Cette action est irréversible.",
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/tasks?id=${taskId}`, {
                        method: "DELETE",
                    });

                    if (response.ok) {
                        setTasks(tasks.filter((t) => t.id !== taskId));
                        addToast("Tâche supprimée", "success");
                    }
                } catch (error) {
                    console.error("Error deleting task:", error);
                    addToast("Erreur lors de la suppression", "error");
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find((t) => t.id === active.id);
        if (task) {
            setActiveTask(task);
            setOriginalTask({ ...task });
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id;

        if (view === "category") {
            const categories = CATEGORIES.map((c) => c.key);
            let targetCategory: TaskCategory | null = null;

            if (categories.includes(overId as TaskCategory)) {
                targetCategory = overId as TaskCategory;
            } else {
                const overTask = tasks.find((t) => t.id === overId);
                if (overTask) {
                    targetCategory = overTask.category;
                }
            }

            if (targetCategory) {
                const activeTask = tasks.find((t) => t.id === activeId);
                if (activeTask && activeTask.category !== targetCategory) {
                    setTasks(
                        tasks.map((t) =>
                            t.id === activeId
                                ? {
                                      ...t,
                                      category: targetCategory as TaskCategory,
                                  }
                                : t
                        )
                    );
                }
            }
        } else {
            const statuses = STATUSES.map((s) => s.key);
            let targetStatus: TaskStatus | null = null;

            if (statuses.includes(overId as TaskStatus)) {
                targetStatus = overId as TaskStatus;
            } else {
                const overTask = tasks.find((t) => t.id === overId);
                if (overTask) {
                    targetStatus = overTask.status;
                }
            }

            if (targetStatus) {
                const activeTask = tasks.find((t) => t.id === activeId);
                if (activeTask && activeTask.status !== targetStatus) {
                    setTasks(
                        tasks.map((t) =>
                            t.id === activeId
                                ? { ...t, status: targetStatus as TaskStatus }
                                : t
                        )
                    );
                }
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        console.log("handleDragEnd:", {
            activeId: active.id,
            overId: over?.id,
            originalTask,
        });
        setActiveTask(null);

        if (!over || !originalTask) {
            console.log("No over or originalTask, aborting");
            setOriginalTask(null);
            return;
        }

        const activeId = active.id as number;
        const overId = over.id;

        if (view === "category") {
            const categories = CATEGORIES.map((c) => c.key);

            let targetCategory: TaskCategory | null = null;

            if (categories.includes(overId as TaskCategory)) {
                targetCategory = overId as TaskCategory;
            } else {
                const overTask = tasks.find((t) => t.id === overId);
                if (overTask) {
                    targetCategory = overTask.category;
                }
            }

            console.log(
                "Target category:",
                targetCategory,
                "Original:",
                originalTask.category
            );

            if (targetCategory && originalTask.category !== targetCategory) {
                console.log(
                    "Calling updateTaskCategory:",
                    activeId,
                    targetCategory
                );
                await updateTaskCategory(activeId, targetCategory);
            }
        } else {
            const statuses = STATUSES.map((s) => s.key);
            let targetStatus: TaskStatus | null = null;

            if (statuses.includes(overId as TaskStatus)) {
                targetStatus = overId as TaskStatus;
            } else {
                const overTask = tasks.find((t) => t.id === overId);
                if (overTask) {
                    targetStatus = overTask.status;
                }
            }

            if (targetStatus) {
                if (targetStatus === "done") {
                    await completeAndArchiveTask(activeId);
                } else if (originalTask.status !== targetStatus) {
                    await updateTaskStatus(activeId, targetStatus);
                }
            }
        }

        setOriginalTask(null);
    };

    const activeTasks = tasks.filter((t) => t.status !== "archived");
    const archivedTasks = tasks.filter((t) => t.status === "archived");

    const getTasksByCategory = (category: TaskCategory) =>
        activeTasks.filter((t) => t.category === category);

    const getTasksByStatus = (status: TaskStatus) =>
        activeTasks.filter((t) => t.status === status);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl">Chargement...</div>
            </div>
        );
    }

    return (
        <>
            <Confetti show={showConfetti} />

            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors"
                        >
                            ← Retour
                        </motion.button>

                        <h1 className="text-4xl font-bold">Ton Kanban</h1>

                        <div className="flex gap-3 flex-wrap justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                    setView(
                                        view === "category"
                                            ? "status"
                                            : "category"
                                    )
                                }
                                className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors"
                            >
                                Vue:{" "}
                                {view === "category" ? "Catégorie" : "Statut"}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowArchived(!showArchived)}
                                className={`px-6 py-3 rounded-xl transition-colors ${
                                    showArchived
                                        ? "bg-slate-600 hover:bg-slate-500"
                                        : "bg-gray-700 hover:bg-gray-600"
                                }`}
                            >
                                📦 Archivées ({archivedTasks.length})
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setAddingTask(true)}
                                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl transition-colors"
                            >
                                + Ajouter
                            </motion.button>
                        </div>
                    </div>

                    <div className="text-center text-gray-500 text-sm mb-4">
                        💡 Glisse-dépose les tâches entre les colonnes
                    </div>

                    <AnimatePresence>
                        {showArchived && archivedTasks.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="bg-slate-800/50 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-4 text-slate-300">
                                        📦 Tâches archivées
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {archivedTasks.map((task) => {
                                            const cat = CATEGORIES.find(
                                                (c) => c.key === task.category
                                            );
                                            return (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className={`bg-slate-700/50 rounded-xl p-4 border-l-4 ${cat?.border}`}
                                                >
                                                    <p className="text-slate-300 line-through mb-2">
                                                        {task.text}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mb-3">
                                                        {cat?.label} •{" "}
                                                        {task.added}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                restoreTask(
                                                                    task.id
                                                                )
                                                            }
                                                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1 px-2 text-xs rounded transition"
                                                        >
                                                            ↩ Restaurer
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                deleteTask(
                                                                    task.id
                                                                )
                                                            }
                                                            className="flex-1 bg-red-900 hover:bg-red-800 text-red-200 py-1 px-2 text-xs rounded transition"
                                                        >
                                                            ✕ Supprimer
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        {view === "category" ? (
                            <CategoryView
                                tasks={activeTasks}
                                getTasksByCategory={getTasksByCategory}
                                updateTaskStatus={updateTaskStatus}
                                completeAndArchiveTask={completeAndArchiveTask}
                                deleteTask={deleteTask}
                                onOpenDetail={setSelectedTask}
                            />
                        ) : (
                            <StatusView
                                tasks={activeTasks}
                                getTasksByStatus={getTasksByStatus}
                                updateTaskStatus={updateTaskStatus}
                                completeAndArchiveTask={completeAndArchiveTask}
                                deleteTask={deleteTask}
                                onOpenDetail={setSelectedTask}
                            />
                        )}

                        <DragOverlay>
                            {activeTask ? (
                                <TaskCardOverlay task={activeTask} />
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {addingTask && (
                        <AddTaskModal
                            newTask={newTask}
                            setNewTask={setNewTask}
                            onAdd={addTask}
                            onCancel={() => {
                                setAddingTask(false);
                                setNewTask({ text: "", category: "urgent" });
                            }}
                        />
                    )}

                    <AnimatePresence>
                        {selectedTask && (
                            <TaskDetailModal
                                task={selectedTask}
                                onClose={() => setSelectedTask(null)}
                                onUpdate={(updatedTask) => {
                                    setTasks(
                                        tasks.map((t) =>
                                            t.id === updatedTask.id
                                                ? updatedTask
                                                : t
                                        )
                                    );
                                    setSelectedTask(updatedTask);
                                }}
                                onDelete={(taskId) => {
                                    deleteTask(taskId);
                                    setSelectedTask(null);
                                }}
                                onComplete={(taskId) => {
                                    completeAndArchiveTask(taskId);
                                    setSelectedTask(null);
                                }}
                            />
                        )}
                    </AnimatePresence>

                    <Toast toasts={toasts} removeToast={removeToast} />

                    <ConfirmModal
                        isOpen={confirmModal.isOpen}
                        title={confirmModal.title}
                        message={confirmModal.message}
                        confirmText="Supprimer"
                        cancelText="Annuler"
                        confirmColor="red"
                        onConfirm={confirmModal.onConfirm}
                        onCancel={() =>
                            setConfirmModal((prev) => ({
                                ...prev,
                                isOpen: false,
                            }))
                        }
                    />
                </div>
            </div>
        </>
    );
}

function DroppableColumn({
    id,
    children,
    color,
    label,
    count,
}: {
    id: string;
    children: React.ReactNode;
    color: string;
    label: string;
    count: number;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef}>
            <div
                className={`${color} rounded-xl p-3 mb-4 text-center font-bold transition-all ${
                    isOver ? "ring-2 ring-white ring-opacity-50 scale-105" : ""
                }`}
            >
                {label} ({count})
            </div>
            <div
                className={`space-y-3 min-h-25 rounded-xl p-2 transition-all ${
                    isOver ? "bg-gray-700/30" : ""
                }`}
            >
                {children}
            </div>
        </div>
    );
}

function SortableTaskCard({
    task,
    onUpdateStatus,
    onComplete,
    onDelete,
    onOpenDetail,
}: {
    task: Task;
    onUpdateStatus: (taskId: number, status: TaskStatus) => void;
    onComplete: (taskId: number) => void;
    onDelete: (taskId: number) => void;
    onOpenDetail: (task: Task) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const cat = CATEGORIES.find((c) => c.key === task.category);
    const checklistCount = task.checklist?.length || 0;
    const checklistDone = task.checklist?.filter((i) => i.checked).length || 0;

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-800 rounded-xl p-4 border-l-4 ${
                    cat?.border
                } ${
                    isDragging ? "shadow-2xl" : ""
                } cursor-pointer hover:bg-gray-750 transition`}
                onClick={() => onOpenDetail(task)}
            >
                <div
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-grab active:cursor-grabbing mb-2 text-gray-500 hover:text-gray-300 flex items-center gap-2"
                >
                    <span className="text-lg">⠿</span>
                    <span className="text-xs">Glisser</span>
                </div>

                <p className="mb-2 font-medium">{task.text}</p>

                <div className="flex gap-2 mb-3 flex-wrap">
                    {task.description && (
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
                            📝 Description
                        </span>
                    )}
                    {checklistCount > 0 && (
                        <span
                            className={`text-xs px-2 py-1 rounded ${
                                checklistDone === checklistCount
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-gray-700 text-gray-400"
                            }`}
                        >
                            ☑️ {checklistDone}/{checklistCount}
                        </span>
                    )}
                </div>

                <div
                    className="flex gap-1 mb-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    {STATUSES.map((status) => (
                        <button
                            key={status.key}
                            onClick={() => {
                                if (status.key === "done") {
                                    onComplete(task.id);
                                } else {
                                    onUpdateStatus(task.id, status.key);
                                }
                            }}
                            className={`flex-1 py-1 text-xs rounded transition ${
                                task.status === status.key
                                    ? `${status.color} text-white`
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            {status.key === "done" ? "✓ " : ""}
                            {status.label}
                        </button>
                    ))}
                </div>

                <p className="text-xs text-gray-500 mb-2">{task.added}</p>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    className="w-full bg-red-900 hover:bg-red-800 text-red-200 py-1 text-xs rounded transition"
                >
                    ✕ Supprimer
                </button>
            </motion.div>
        </div>
    );
}

function TaskCardOverlay({ task }: { task: Task }) {
    const cat = CATEGORIES.find((c) => c.key === task.category);

    return (
        <div
            className={`bg-gray-800 rounded-xl p-4 border-l-4 ${cat?.border} shadow-2xl rotate-3 opacity-90`}
        >
            <p className="mb-3">{task.text}</p>
            <p className="text-xs text-gray-500">{task.added}</p>
        </div>
    );
}

function CategoryView({
    tasks,
    getTasksByCategory,
    updateTaskStatus,
    completeAndArchiveTask,
    deleteTask,
    onOpenDetail,
}: {
    tasks: Task[];
    getTasksByCategory: (category: TaskCategory) => Task[];
    updateTaskStatus: (taskId: number, status: TaskStatus) => void;
    completeAndArchiveTask: (taskId: number) => void;
    deleteTask: (taskId: number) => void;
    onOpenDetail: (task: Task) => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => {
                const categoryTasks = getTasksByCategory(cat.key);
                return (
                    <SortableContext
                        key={cat.key}
                        items={categoryTasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <DroppableColumn
                            id={cat.key}
                            color={cat.color}
                            label={cat.label}
                            count={categoryTasks.length}
                        >
                            {categoryTasks.map((task) => (
                                <SortableTaskCard
                                    key={task.id}
                                    task={task}
                                    onUpdateStatus={updateTaskStatus}
                                    onComplete={completeAndArchiveTask}
                                    onDelete={deleteTask}
                                    onOpenDetail={onOpenDetail}
                                />
                            ))}
                        </DroppableColumn>
                    </SortableContext>
                );
            })}
        </div>
    );
}

function StatusView({
    tasks,
    getTasksByStatus,
    updateTaskStatus,
    completeAndArchiveTask,
    deleteTask,
    onOpenDetail,
}: {
    tasks: Task[];
    getTasksByStatus: (status: TaskStatus) => Task[];
    updateTaskStatus: (taskId: number, status: TaskStatus) => void;
    completeAndArchiveTask: (taskId: number) => void;
    deleteTask: (taskId: number) => void;
    onOpenDetail: (task: Task) => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUSES.map((status) => {
                const statusTasks = getTasksByStatus(status.key);
                return (
                    <SortableContext
                        key={status.key}
                        items={statusTasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <DroppableColumn
                            id={status.key}
                            color={status.color}
                            label={status.label}
                            count={statusTasks.length}
                        >
                            {statusTasks.map((task) => (
                                <SortableTaskCard
                                    key={task.id}
                                    task={task}
                                    onUpdateStatus={updateTaskStatus}
                                    onComplete={completeAndArchiveTask}
                                    onDelete={deleteTask}
                                    onOpenDetail={onOpenDetail}
                                />
                            ))}
                        </DroppableColumn>
                    </SortableContext>
                );
            })}
        </div>
    );
}

function AddTaskModal({
    newTask,
    setNewTask,
    onAdd,
    onCancel,
}: {
    newTask: { text: string; category: TaskCategory };
    setNewTask: (task: { text: string; category: TaskCategory }) => void;
    onAdd: () => void;
    onCancel: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-4">Nouvelle tâche</h2>

                <textarea
                    value={newTask.text}
                    onChange={(e) =>
                        setNewTask({ ...newTask, text: e.target.value })
                    }
                    placeholder="Décris ta tâche..."
                    className="w-full bg-gray-700 text-white p-3 rounded-xl outline-none resize-none mb-4"
                    rows={4}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                            onAdd();
                        }
                    }}
                />

                <p className="text-sm text-gray-400 mb-2">Catégorie:</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() =>
                                setNewTask({ ...newTask, category: cat.key })
                            }
                            className={`px-3 py-2 rounded-xl transition ${
                                newTask.category === cat.key
                                    ? `${cat.color} text-white`
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            {newTask.category === cat.key ? "[X]" : "[ ]"}{" "}
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onAdd}
                        className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-xl transition font-bold"
                    >
                        Ajouter
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-xl transition"
                    >
                        Annuler
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            discordId: string;
            isAdmin: boolean;
        } & DefaultSession["user"];
    }

    interface Profile {
        id: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        discordId?: string;
        isAdmin?: boolean;
    }
}

export type TaskStatus = "todo" | "doing" | "done" | "archived";
export type TaskCategory = "urgent" | "deadline" | "admin" | "creative";
export type QuestionMode = "normal" | "crisis";
export type KanbanView = "category" | "status";

export interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface Task {
    id: number;
    text: string;
    description?: string;
    checklist?: ChecklistItem[];
    category: TaskCategory;
    status: TaskStatus;
    added: string;
    created_at: string;
}

export interface Question {
    id?: number;
    category: string;
    question: string;
    mode: QuestionMode;
    order_index?: number;
}

export interface Session {
    id: number;
    mode: QuestionMode;
    answers: SessionAnswer[];
    created_at: string;
    exported_at?: string;
}

export interface SessionAnswer {
    questionIndex: number;
    category: string;
    question: string;
    answer: string;
}

export interface CategoryConfig {
    key: TaskCategory;
    label: string;
    color: string;
    hover: string;
    border: string;
}

export interface StatusConfig {
    key: TaskStatus;
    label: string;
    color: string;
}

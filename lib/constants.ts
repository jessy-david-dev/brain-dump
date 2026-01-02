import { CategoryConfig, Question, StatusConfig } from "@/types";

export const NORMAL_QUESTIONS: Question[] = [
    {
        category: "Brain",
        question: "Qu'ai-je appris de nouveau aujourd'hui ?",
        mode: "normal",
    },
    {
        category: "Brain",
        question: "Quel problème ai-je résolu et comment ?",
        mode: "normal",
    },
    {
        category: "Brain",
        question: "Quelle pensée récurrente occupe mon esprit ?",
        mode: "normal",
    },
    {
        category: "Brain",
        question: "Qu'est-ce qui m'a mentalement fatigué aujourd'hui ?",
        mode: "normal",
    },
    {
        category: "Émotions",
        question: "Comment je me sens maintenant ? (en un mot)",
        mode: "normal",
    },
    {
        category: "Émotions",
        question: "Quel événement a le plus impacté mon humeur aujourd'hui ?",
        mode: "normal",
    },
    {
        category: "Émotions",
        question: "De quelle émotion ai-je besoin de me libérer ?",
        mode: "normal",
    },
    {
        category: "Corps",
        question: "Quel est mon niveau d'énergie actuel ? (1-10)",
        mode: "normal",
    },
    {
        category: "Corps",
        question: "Ai-je pris soin de mon corps aujourd'hui ? Comment ?",
        mode: "normal",
    },
    {
        category: "Actions",
        question: "Quelle est ma priorité #1 pour demain matin ?",
        mode: "normal",
    },
    {
        category: "Actions",
        question: "Qu'ai-je accompli aujourd'hui dont je suis fier·e ?",
        mode: "normal",
    },
    {
        category: "Relations",
        question: "Quelle interaction m'a marqué aujourd'hui ?",
        mode: "normal",
    },
    {
        category: "Créativité",
        question: "Quelle idée créative m'inspire en ce moment ?",
        mode: "normal",
    },
    {
        category: "Clôture",
        question: "Pour quoi suis-je reconnaissant·e aujourd'hui ?",
        mode: "normal",
    },
    {
        category: "Clôture",
        question: "Que puis-je lâcher avant de dormir ?",
        mode: "normal",
    },
];

export const CRISIS_QUESTIONS: Question[] = [
    {
        category: "Sécurité",
        question: "Où suis-je en ce moment ? Suis-je en sécurité physique ?",
        mode: "crisis",
    },
    {
        category: "Sécurité",
        question: "Suis-je en danger émotionnel ou psychologique immédiat ?",
        mode: "crisis",
    },
    {
        category: "Sécurité",
        question: "Ai-je besoin d'aide médicale immédiate ?",
        mode: "crisis",
    },
    {
        category: "Ancrage",
        question: "Nomme 5 choses que je vois autour de moi",
        mode: "crisis",
    },
    {
        category: "Ancrage",
        question: "Nomme 3 sons que j'entends en ce moment",
        mode: "crisis",
    },
    {
        category: "Ancrage",
        question: "Nomme 1 sensation physique (température, texture, contact)",
        mode: "crisis",
    },
    {
        category: "Besoins",
        question: "Ai-je mangé dans les dernières 6 heures ?",
        mode: "crisis",
    },
    {
        category: "Besoins",
        question: "Ai-je bu de l'eau récemment ?",
        mode: "crisis",
    },
    {
        category: "Émotions",
        question: "Quelle émotion domine maintenant ? (en un mot)",
        mode: "crisis",
    },
    {
        category: "Émotions",
        question: "Niveau de détresse : 1 (faible) à 10 (insupportable)",
        mode: "crisis",
    },
    {
        category: "Respiration",
        question: "Peux-tu prendre 3 respirations lentes maintenant ?",
        mode: "crisis",
    },
    {
        category: "Action",
        question:
            "Quelle est la plus PETITE action que je peux faire maintenant ?",
        mode: "crisis",
    },
];

export const CATEGORIES: CategoryConfig[] = [
    {
        key: "urgent",
        label: "Urgent",
        color: "bg-red-500",
        hover: "hover:bg-red-600",
        border: "border-red-500",
    },
    {
        key: "deadline",
        label: "Deadline",
        color: "bg-orange-500",
        hover: "hover:bg-orange-600",
        border: "border-orange-500",
    },
    {
        key: "admin",
        label: "Admin",
        color: "bg-purple-500",
        hover: "hover:bg-purple-600",
        border: "border-purple-500",
    },
    {
        key: "creative",
        label: "Créatif",
        color: "bg-teal-500",
        hover: "hover:bg-teal-600",
        border: "border-teal-500",
    },
];

export const STATUSES: StatusConfig[] = [
    { key: "todo", label: "À faire", color: "bg-gray-600" },
    { key: "doing", label: "En cours", color: "bg-orange-500" },
    { key: "done", label: "Terminé", color: "bg-green-500" },
];

export const ALL_STATUSES: StatusConfig[] = [
    ...STATUSES,
    { key: "archived", label: "Archivé", color: "bg-slate-700" },
];

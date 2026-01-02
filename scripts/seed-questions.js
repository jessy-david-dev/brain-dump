const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const NORMAL_QUESTIONS = [
    ["Brain", "Qu'ai-je appris de nouveau aujourd'hui ?"],
    ["Brain", "Quel problème ai-je résolu et comment ?"],
    ["Brain", "Quelle pensée récurrente occupe mon esprit ?"],
    ["Brain", "Qu'est-ce qui m'a mentalement fatigué aujourd'hui ?"],
    ["Brain", "Qu'est-ce qui m'a mentalement apaisé aujourd'hui ?"],
    ["Brain", "Ai-je trop optimisé ou itéré sur quelque chose ?"],
    ["Émotions", "Comment je me sens maintenant ? (en un mot)"],
    ["Émotions", "Quel événement a le plus impacté mon humeur aujourd'hui ?"],
    ["Émotions", "De quelle émotion ai-je besoin de me libérer ?"],
    ["Émotions", "De quoi aurais-je eu besoin émotionnellement aujourd'hui ?"],
    ["Émotions", "Ai-je été dur·e avec moi-même aujourd'hui ?"],
    ["Corps", "Quel est mon niveau d'énergie actuel ? (1-10)"],
    ["Corps", "Ai-je pris soin de mon corps aujourd'hui ? Comment ?"],
    ["Corps", "Quelle tension ou douleur physique je ressens ?"],
    ["Corps", "Qu'est-ce qui a soulagé mon corps aujourd'hui ?"],
    ["Corps", "Qu'est-ce qui a aggravé mes douleurs ?"],
    ["Corps", "Ai-je respecté mes limites physiques ?"],
    ["Actions", "Quelle est ma priorité #1 pour demain matin ?"],
    ["Actions", "Qu'ai-je accompli aujourd'hui dont je suis fier·e ?"],
    ["Actions", "Qu'est-ce qui bloque ma productivité actuellement ?"],
    ["Actions", "À quel rythme ai-je réellement avancé aujourd'hui ?"],
    ["Actions", "Ai-je le droit de ne rien faire ce soir ?"],
    ["Relations", "Quelle interaction m'a marqué aujourd'hui ?"],
    ["Relations", "De qui ai-je besoin de me rapprocher ?"],
    ["Relations", "Quel besoin relationnel n'est pas comblé en ce moment ?"],
    ["Relations", "Me suis-je senti·e respecté·e aujourd'hui ?"],
    ["Relations", "Ai-je posé ou identifié une limite importante ?"],
    ["Sécurité", "Mon environnement actuel est-il sain et sûr ?"],
    [
        "Sécurité",
        "Quelles substances ai-je consommées ? (alcool, café, médicaments)",
    ],
    ["Sécurité", "De quelles ressources matérielles ai-je besoin ?"],
    ["Créativité", "Quelle idée créative m'inspire en ce moment ?"],
    ["Créativité", "Sur quel projet personnel ai-je envie d'avancer ?"],
    ["Créativité", "Qu'est-ce qui a stimulé mon imagination aujourd'hui ?"],
    ["Créativité", "Ai-je créé sans objectif ou rendement aujourd'hui ?"],
    ["Créativité", "Qu'est-ce qui m'inspire sans me fatiguer ?"],
    ["Clôture", "Pour quoi suis-je reconnaissant·e aujourd'hui ?"],
    ["Clôture", "Quelle petite victoire mérite d'être célébrée ?"],
    ["Clôture", "Que puis-je lâcher avant de dormir ?"],
    ["Clôture", "De quoi mon corps a-t-il besoin cette nuit ?"],
    ["Clôture", "Puis-je m'autoriser à m'arrêter maintenant ?"],
    [
        "Clôture",
        "Qu'est-ce que je peux faire à 1 % pour me lancer sur autre chose ?",
    ],
];

const CRISIS_QUESTIONS = [
    ["Sécurité", "Où suis-je en ce moment ? Suis-je en sécurité physique ?"],
    ["Sécurité", "Suis-je en danger émotionnel ou psychologique immédiat ?"],
    ["Sécurité", "Ai-je besoin d'aide médicale immédiate ?"],
    ["Sécurité", "Qui peut venir m'aider maintenant ? (nom et numéro)"],
    ["Ancrage", "Nomme 5 choses que je vois autour de moi"],
    ["Ancrage", "Nomme 3 sons que j'entends en ce moment"],
    ["Ancrage", "Nomme 1 sensation physique (température, texture, contact)"],
    ["Besoins", "Ai-je mangé dans les dernières 6 heures ?"],
    ["Besoins", "Ai-je bu de l'eau récemment ?"],
    ["Besoins", "Ai-je dormi ces dernières 24 heures ?"],
    ["Émotions", "Quelle émotion domine maintenant ? (en un mot)"],
    ["Émotions", "Niveau de détresse : 1 (faible) à 10 (insupportable)"],
    ["Respiration", "Peux-tu prendre 3 respirations lentes maintenant ?"],
    ["Respiration", "Comment te sens-tu après ces respirations ?"],
    ["Pensées", "Quelle pensée est la plus intense en ce moment ?"],
    ["Pensées", "Cette pensée est-elle un FAIT ou une INTERPRÉTATION ?"],
    ["Pensées", "Cette situation sera-t-elle encore aussi intense dans 24h ?"],
    ["Pensées", "Que dirais-je à un·e ami·e dans la même situation ?"],
    [
        "Soutien",
        "Ai-je quelqu'un avec qui je peux être vulnérable maintenant ?",
    ],
    [
        "Soutien",
        "Qu'est-ce qui me réconforte habituellement dans ces moments ?",
    ],
    [
        "Action",
        "Quelle est la plus PETITE action que je peux faire maintenant ?",
    ],
    ["Action", "Qui puis-je appeler si ça empire ? (nom + numéro à portée)"],
    [
        "Ressources",
        "Numéros d'urgence : 15 (SAMU), 112 (Urgences EU), 3114 (Suicide)",
    ],
    ["Ressources", "Y a-t-il un lieu sûr où je peux aller maintenant ?"],
    [
        "Récupération",
        "Puis-je me reposer sans résoudre le problème maintenant ?",
    ],
];

async function seedQuestions() {
    console.log("🌱 Importation des questions...");

    try {
        const existing = await pool.query(
            "SELECT COUNT(*) as count FROM questions"
        );
        if (parseInt(existing.rows[0].count) > 0) {
            console.log("⚠️  Des questions existent déjà. Suppression...");
            await pool.query("DELETE FROM questions");
        }

        for (let i = 0; i < NORMAL_QUESTIONS.length; i++) {
            const [category, question] = NORMAL_QUESTIONS[i];
            await pool.query(
                "INSERT INTO questions (category, question, mode, order_index) VALUES ($1, $2, $3, $4)",
                [category, question, "normal", i]
            );
        }
        console.log(`✅ ${NORMAL_QUESTIONS.length} questions NORMAL importées`);

        for (let i = 0; i < CRISIS_QUESTIONS.length; i++) {
            const [category, question] = CRISIS_QUESTIONS[i];
            await pool.query(
                "INSERT INTO questions (category, question, mode, order_index) VALUES ($1, $2, $3, $4)",
                [category, question, "crisis", i]
            );
        }
        console.log(`✅ ${CRISIS_QUESTIONS.length} questions CRISIS importées`);

        console.log("🎉 Importation terminée !");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de l'importation:", error);
        process.exit(1);
    }
}

seedQuestions();

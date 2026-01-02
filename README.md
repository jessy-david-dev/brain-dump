# 🧠 Brain Dump

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

## ✨ Fonctionnalités

-   🌿 **Mode Normal** : Questions douces pour organiser ta journée
-   🆘 **Mode Crise** : Questions adaptées quand ça ne va pas
-   📋 **Kanban** : Gère tes tâches par catégorie ou statut (Trello)
-   📤 **Export** : Télécharge tes sessions en Markdown
-   🔐 **Auth Discord** : Connexion sécurisée via Discord
-   👥 **Multi-utilisateurs** : Gestion des accès par Discord ID
-   ⚙️ **Admin** : Les admins peuvent gérer les questions

## 🚀 Installation

### Prérequis

-   Node.js 18+
-   pnpm
-   PostgreSQL

### Configuration

1. Clone le repo :

```bash
git clone https://github.com/jessy-david-dev/brain-dump.git
cd brain-dump
```

2. Installe les dépendances :

```bash
pnpm install
```

3. Configure les variables d'environnement :

```bash
cp .env.example .env.local
```

4. Remplir le fichier `.env.local`

5. Initialise la base de données :

```bash
pnpm db:init
```

6. (Optionnel) Seed les questions par défaut :

```bash
pnpm db:seed
```

### Lancement

```bash
# Développement
pnpm dev

# Production
pnpm build
pnpm start
```

L'app sera disponible sur [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration Discord OAuth

1. [Discord Developer Portal](https://discord.com/developers/applications)
2. Crée une nouvelle application
3. Dans **OAuth2** > **General**, ajoute l'URL de callback :
    - `http://localhost:3000/api/auth/callback/discord` (dev)
    - `https://ton-domaine.com/api/auth/callback/discord` (prod)
4. Copie le **Client ID** et **Client Secret** dans ton `.env.local`

## 🛡️ Gestion des accès

-   **`ALLOWED_DISCORD_IDS`** : Liste des Discord IDs autorisés à se connecter
-   **`ADMIN_DISCORD_IDS`** : Liste des Discord IDs pouvant gérer les questions

## 📝 License

MIT - [Jessy DAVID](https://jessy-david.dev)

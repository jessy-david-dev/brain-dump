import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
        process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
});

export async function query(text: string, params?: any[]) {
    const result = await pool.query(text, params);
    return result;
}

export async function initDatabase() {
    await query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            text TEXT NOT NULL,
            description TEXT,
            checklist JSONB DEFAULT '[]',
            category VARCHAR(20) NOT NULL CHECK(category IN ('urgent', 'deadline', 'admin', 'creative')),
            status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'doing', 'done', 'archived')),
            added VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            mode VARCHAR(20) NOT NULL CHECK(mode IN ('normal', 'crisis')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            exported_at TIMESTAMP
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS session_answers (
            id SERIAL PRIMARY KEY,
            session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            question_index INTEGER NOT NULL,
            category TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS questions (
            id SERIAL PRIMARY KEY,
            category TEXT NOT NULL,
            question TEXT NOT NULL,
            mode VARCHAR(20) NOT NULL CHECK(mode IN ('normal', 'crisis')),
            order_index INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await query(
        `CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category)`
    );
    await query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
    await query(
        `CREATE INDEX IF NOT EXISTS idx_sessions_mode ON sessions(mode)`
    );
    await query(
        `CREATE INDEX IF NOT EXISTS idx_session_answers_session_id ON session_answers(session_id)`
    );
    await query(
        `CREATE INDEX IF NOT EXISTS idx_questions_mode ON questions(mode)`
    );
}

export default { query, initDatabase };

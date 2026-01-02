import { initDatabase, query } from "@/lib/db";
import { SessionAnswer } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await initDatabase();
        const sessionsResult = await query(
            "SELECT * FROM sessions ORDER BY created_at DESC"
        );

        const sessions = await Promise.all(
            sessionsResult.rows.map(async (session: any) => {
                const answersResult = await query(
                    "SELECT * FROM session_answers WHERE session_id = $1 ORDER BY question_index",
                    [session.id]
                );

                return {
                    id: session.id,
                    mode: session.mode,
                    created_at: session.created_at,
                    exported_at: session.exported_at,
                    answers: answersResult.rows.map((a: any) => ({
                        questionIndex: a.question_index,
                        category: a.category,
                        question: a.question,
                        answer: a.answer,
                    })),
                };
            })
        );

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await initDatabase();
        const body = await request.json();
        const { mode, answers } = body;

        if (!mode || !answers) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const sessionResult = await query(
            "INSERT INTO sessions (mode) VALUES ($1) RETURNING *",
            [mode]
        );

        const sessionId = sessionResult.rows[0].id;

        for (const answer of answers as SessionAnswer[]) {
            if (answer.answer.trim()) {
                await query(
                    "INSERT INTO session_answers (session_id, question_index, category, question, answer) VALUES ($1, $2, $3, $4, $5)",
                    [
                        sessionId,
                        answer.questionIndex,
                        answer.category,
                        answer.question,
                        answer.answer,
                    ]
                );
            }
        }

        const answersData = await query(
            "SELECT * FROM session_answers WHERE session_id = $1 ORDER BY question_index",
            [sessionId]
        );

        const newSession = {
            id: sessionResult.rows[0].id,
            mode: sessionResult.rows[0].mode,
            created_at: sessionResult.rows[0].created_at,
            answers: answersData.rows.map((a: any) => ({
                questionIndex: a.question_index,
                category: a.category,
                question: a.question,
                answer: a.answer,
            })),
        };

        return NextResponse.json(newSession, { status: 201 });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}

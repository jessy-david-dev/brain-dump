import { initDatabase, query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await initDatabase();
        const result = await query(
            "SELECT * FROM tasks ORDER BY created_at DESC"
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json(
            { error: "Failed to fetch tasks" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await initDatabase();
        const body = await request.json();
        const { text, category, description } = body;

        if (!text || !category) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const added = new Date().toLocaleDateString("fr-FR");

        const result = await query(
            "INSERT INTO tasks (text, description, checklist, category, status, added) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [text, description || null, "[]", category, "todo", added]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json(
            { error: "Failed to create task" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, category, text, description, checklist } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Missing task id" },
                { status: 400 }
            );
        }

        const updates: string[] = [];
        const args: (string | number | null)[] = [];
        let paramIndex = 1;

        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            args.push(status);
        }
        if (category !== undefined) {
            updates.push(`category = $${paramIndex++}`);
            args.push(category);
        }
        if (text !== undefined) {
            updates.push(`text = $${paramIndex++}`);
            args.push(text);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            args.push(description);
        }
        if (checklist !== undefined) {
            updates.push(`checklist = $${paramIndex++}`);
            args.push(JSON.stringify(checklist));
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        args.push(id);

        const result = await query(
            `UPDATE tasks SET ${updates.join(
                ", "
            )} WHERE id = $${paramIndex} RETURNING *`,
            args
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json(
            { error: "Failed to update task" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Missing task id" },
                { status: 400 }
            );
        }

        await query("DELETE FROM tasks WHERE id = $1", [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting task:", error);
        return NextResponse.json(
            { error: "Failed to delete task" },
            { status: 500 }
        );
    }
}

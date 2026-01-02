import { initDatabase, query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.isAdmin === true;
}

export async function GET(request: NextRequest) {
    try {
        await initDatabase();
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode");

        let result;
        if (mode) {
            result = await query(
                "SELECT * FROM questions WHERE mode = $1 ORDER BY order_index ASC, id ASC",
                [mode]
            );
        } else {
            result = await query(
                "SELECT * FROM questions ORDER BY mode, order_index ASC, id ASC"
            );
        }

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json(
            { error: "Failed to fetch questions" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        await initDatabase();
        const body = await request.json();
        const { category, question, mode } = body;

        if (!category || !question || !mode) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const maxOrder = await query(
            "SELECT COALESCE(MAX(order_index), -1) as max_order FROM questions WHERE mode = $1",
            [mode]
        );
        const newOrder = parseInt(maxOrder.rows[0].max_order) + 1;

        const result = await query(
            "INSERT INTO questions (category, question, mode, order_index) VALUES ($1, $2, $3, $4) RETURNING *",
            [category, question, mode, newOrder]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json(
            { error: "Failed to create question" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { id, category, question, order_index } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Missing question id" },
                { status: 400 }
            );
        }

        const updates: string[] = [];
        const args: (string | number)[] = [];
        let paramIndex = 1;

        if (category !== undefined) {
            updates.push(`category = $${paramIndex++}`);
            args.push(category);
        }
        if (question !== undefined) {
            updates.push(`question = $${paramIndex++}`);
            args.push(question);
        }
        if (order_index !== undefined) {
            updates.push(`order_index = $${paramIndex++}`);
            args.push(order_index);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        args.push(id);

        const result = await query(
            `UPDATE questions SET ${updates.join(
                ", "
            )} WHERE id = $${paramIndex} RETURNING *`,
            args
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating question:", error);
        return NextResponse.json(
            { error: "Failed to update question" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Missing question id" },
                { status: 400 }
            );
        }

        await query("DELETE FROM questions WHERE id = $1", [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json(
            { error: "Failed to delete question" },
            { status: 500 }
        );
    }
}

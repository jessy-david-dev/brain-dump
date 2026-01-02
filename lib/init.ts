import { initDatabase } from "@/lib/db";

(async () => {
    try {
        await initDatabase();
        console.log("✅ Database initialized");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
    }
})();

export {};

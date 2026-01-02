import AuthProvider from "@/components/AuthProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Brain Dump",
    description: "Organise tes pensées avec Brain Dump",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className="antialiased bg-gray-900 text-white">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}

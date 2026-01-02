import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const ALLOWED_DISCORD_IDS =
    process.env.ALLOWED_DISCORD_IDS?.split(",").map((id) => id.trim()) || [];
const ADMIN_DISCORD_IDS =
    process.env.ADMIN_DISCORD_IDS?.split(",").map((id) => id.trim()) || [];

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ profile }) {
            if (profile?.id && ALLOWED_DISCORD_IDS.includes(profile.id)) {
                return true;
            }
            return "/unauthorized";
        },
        async jwt({ token, profile }) {
            if (profile) {
                token.discordId = profile.id;
                token.isAdmin = ADMIN_DISCORD_IDS.includes(
                    profile.id as string
                );
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.discordId = token.discordId as string;
                session.user.isAdmin = token.isAdmin as boolean;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/unauthorized",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

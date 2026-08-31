import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { generateMerchantIdNumber } from "@/lib/merchant-id-generator"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback_nextauth_secret_32_chars_long!!",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const { db } = await import("@/lib/db");
        const cleanEmail = user.email.trim().toLowerCase();
        let dbUser = await db.user.findUnique({ where: { email: cleanEmail } });
        if (!dbUser) {
          dbUser = await db.user.create({
            data: {
              email: cleanEmail,
              name: user.name || cleanEmail.split("@")[0],
              role: "merchant",
            },
          });
        }
        let merchant = await db.merchant.findUnique({ where: { userId: dbUser.id } }).catch(() => null);
        if (!merchant) {
          merchant = await db.merchant.findFirst({ where: { email: cleanEmail } });
        }
        if (!merchant) {
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + 7);
          const merchantIdNumber = await generateMerchantIdNumber(db);
          merchant = await db.merchant.create({
            data: {
              userId: dbUser.id,
              merchantIdNumber,
              name: user.name || "My Business",
              ownerName: user.name || "",
              email: cleanEmail,
              businessType: "bakery",
              plan: "trial",
              status: "active",
              trialEndsAt,
              onboardingCompleted: false,
              currentStep: 1,
            },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: { params: { scope: 'identify' } },
    }),
  ],
  callbacks: {
    // 登入時的權限檢查
    async signIn({ user, account, profile }: any) {
      const adminId = process.env.ADMIN_DISCORD_ID;
      if (profile?.id === adminId) {
        return true; // 只有指定的 Admin ID 可以登入
      }
      return false; // 其他人拒絕登入
    },
    // 將 Discord ID 存入 Session 供前端使用
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    error: '/auth/error', // 登入失敗導向
  }
})

export { handler as GET, handler as POST }

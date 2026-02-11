import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // 可以額外增加更細緻的邏輯
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // 只有當 token 存在且 ID 符合 ADMIN_DISCORD_ID 時才授權
        return !!token && token.sub === process.env.ADMIN_DISCORD_ID
      },
    },
  }
)

// 設定保護的路徑
export const config = { matcher: ["/admin/:path*"] }

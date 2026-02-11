import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, discordTag, reason } = body;

    if (!gameId || !discordTag || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // TODO: 待串接 Core API，目前僅處理 Discord Webhook

    // 2. 發送 Discord Webhook 通知 (純邏輯實作)
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl && webhookUrl !== "YOUR_WEBHOOK_URL") {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "🌐 來自官網的新白名單申請",
              color: 0xff7d00, // 你的橘色
              fields: [
                { name: "遊戲 ID", value: `\`${gameId}\``, inline: true },
                { name: "Discord", value: discordTag, inline: true },
                { name: "申請原因", value: reason },
              ],
              footer: { text: `系統通知` },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Apply API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

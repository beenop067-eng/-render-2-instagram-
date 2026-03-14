import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { db } from "@workspace/db";
import { analysesTable } from "@workspace/db/schema";
import { fetchInstagramProfile } from "./instagram.js";

let bot: TelegramBot | null = null;
let botRunning = false;
let botStartTime: Date | null = null;
let botInfo: { first_name?: string; username?: string } = {};

export function getBotStatus() {
  return {
    running: botRunning,
    botName: botInfo.first_name,
    botUsername: botInfo.username,
    uptime: botRunning && botStartTime
      ? Math.floor((Date.now() - botStartTime.getTime()) / 1000)
      : 0,
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function buildAnalysisMessage(profile: Awaited<ReturnType<typeof fetchInstagramProfile>>): string {
  const verified = profile.isVerified ? " ✅" : "";
  const accountType = profile.isBusinessAccount
    ? "🏢 Business"
    : profile.isPrivate
    ? "🔒 Private"
    : "👤 Personal";

  const lines: string[] = [
    `╔══════════════════════════╗`,
    `   📊 *INSTAGRAM ANALYSIS*`,
    `╚══════════════════════════╝`,
    ``,
    `👤 *${profile.fullName || profile.username}*${verified}`,
    `🔗 @${profile.username}`,
    `${accountType}${profile.accountCategory ? " · " + profile.accountCategory : ""}`,
    ``,
  ];

  if (profile.bio) {
    lines.push(`📝 _${profile.bio.replace(/\n/g, " ")}_`, ``);
  }

  lines.push(
    `━━━━━━ 📈 STATISTICS ━━━━━━`,
    `👥 Followers:  *${formatNumber(profile.followers)}*`,
    `🔄 Following:  *${formatNumber(profile.following)}*`,
    `📸 Posts:      *${formatNumber(profile.postsCount)}*`,
    ``,
    `━━━━━━ 💡 ENGAGEMENT ━━━━━━`,
    `📊 Rate:       *${profile.engagementRate.toFixed(2)}%*`,
    `❤️  Avg Likes:  *${formatNumber(Math.round(profile.avgLikes))}*`,
    `💬 Avg Cmts:   *${formatNumber(Math.round(profile.avgComments))}*`,
    ``
  );

  if (profile.externalUrl) {
    lines.push(`🔗 *Website:* ${profile.externalUrl}`, ``);
  }

  lines.push(`⏱ _${new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}_`);

  return lines.join("\n");
}

async function clearTelegramConflicts(token: string) {
  try {
    await axios.post(`https://api.telegram.org/bot${token}/deleteWebhook`, {
      drop_pending_updates: true,
    });
    console.log("[Bot] Webhook deleted, pending updates cleared.");
  } catch (e: any) {
    console.warn("[Bot] Could not delete webhook:", e?.message);
  }
  await new Promise((r) => setTimeout(r, 3000));
}

function registerHandlers(b: TelegramBot) {
  b.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from?.first_name ?? "there";
    const botUser = botInfo.username ?? "Instaanalyserbot";
    await b.sendMessage(
      chatId,
      `╔══════════════════════════╗\n` +
      `   🤖 *INSTAGRAM ANALYZER BOT*\n` +
      `╚══════════════════════════╝\n\n` +
      `👋 Hello, *${name}*! Welcome aboard!\n\n` +
      `I can analyze *any public Instagram profile* in seconds. Just one command is all you need.\n\n` +
      `━━━━━━ 📌 COMMANDS ━━━━━━\n` +
      `🔍 \`/analyze username\` — Full analysis\n` +
      `📖 \`/help\` — Commands & usage guide\n` +
      `👁 \`/about\` — About this bot\n\n` +
      `━━━━━━ ⚡ QUICK START ━━━━━━\n` +
      `Just type any username and hit send!\n\n` +
      `_Example:_\n` +
      `\`/analyze cristiano\`\n` +
      `\`cristiano\`  ← also works!\n\n` +
      `📊 You'll instantly get:\n` +
      `• Followers, Following & Posts count\n` +
      `• Engagement Rate\n` +
      `• Avg Likes & Comments\n` +
      `• Account type & category\n` +
      `• Verified & privacy status\n` +
      `• Bio & website link\n\n` +
      `🚀 *Let's start! Send me a username:*`,
      { parse_mode: "Markdown" }
    );
  });

  b.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    await b.sendMessage(
      chatId,
      `╔══════════════════════════╗\n` +
      `   📖 *HOW TO USE THIS BOT*\n` +
      `╚══════════════════════════╝\n\n` +
      `━━━━━━ 🔧 COMMANDS ━━━━━━\n` +
      `• \`/start\` — Welcome & intro\n` +
      `• \`/analyze <username>\` — Analyze a profile\n` +
      `• \`/help\` — Show this guide\n` +
      `• \`/about\` — Bot information\n\n` +
      `━━━━━━ 💡 HOW TO ANALYZE ━━━━━━\n` +
      `*Method 1 — Command:*\n` +
      `\`/analyze cristiano\`\n\n` +
      `*Method 2 — With @ symbol:*\n` +
      `\`/analyze @cristiano\`\n\n` +
      `*Method 3 — Just type the username:*\n` +
      `\`cristiano\`\n\n` +
      `━━━━━━ ✅ EXAMPLES ━━━━━━\n` +
      `\`/analyze instagram\`\n` +
      `\`/analyze natgeo\`\n` +
      `\`/analyze nasa\`\n\n` +
      `━━━━━━ ⚠️ NOTES ━━━━━━\n` +
      `• Works on *public accounts only*\n` +
      `• Private accounts show limited info\n` +
      `• Results are near real-time\n\n` +
      `_Ready? Just send me a username!_`,
      { parse_mode: "Markdown" }
    );
  });

  b.onText(/\/about/, async (msg) => {
    const chatId = msg.chat.id;
    const botUser = botInfo.username ?? "Instaanalyserbot";
    await b.sendMessage(
      chatId,
      `╔══════════════════════════╗\n` +
      `   ℹ️ *ABOUT THIS BOT*\n` +
      `╚══════════════════════════╝\n\n` +
      `🤖 *Instagram Analyzer Bot*\n` +
      `@${botUser}\n\n` +
      `This bot lets you analyze any public Instagram profile with a single command. Get detailed statistics, engagement rates, and profile insights instantly.\n\n` +
      `━━━━━━ 🛠 FEATURES ━━━━━━\n` +
      `✅ Followers & Following count\n` +
      `✅ Post count\n` +
      `✅ Engagement rate calculation\n` +
      `✅ Average Likes & Comments\n` +
      `✅ Account type detection\n` +
      `✅ Verified & privacy status\n` +
      `✅ Bio & website extraction\n\n` +
      `━━━━━━ 📡 STATUS ━━━━━━\n` +
      `🟢 Bot is online and ready\n\n` +
      `_Share this bot: t.me/${botUser}_`,
      { parse_mode: "Markdown" }
    );
  });

  b.onText(/\/analyze(?:\s+(.+))?/, async (msg, match) => {
    const username = match?.[1]?.trim() ?? null;
    await handleAnalyzeCommand(b, msg, username);
  });

  b.on("message", async (msg) => {
    if (!msg.text) return;
    const text = msg.text.trim();
    if (text.startsWith("/")) return;
    if (/^@?[\w.][\w.]{0,29}$/.test(text)) {
      await handleAnalyzeCommand(b, msg, text);
    }
  });

  b.on("polling_error", (error) => {
    const msg = error.message ?? String(error);
    if (!msg.includes("409")) {
      console.error("[Bot] Polling error:", msg);
    }
  });
}

async function handleAnalyzeCommand(b: TelegramBot, msg: TelegramBot.Message, username: string | null) {
  const chatId = msg.chat.id;
  const requestedBy = msg.from?.username ?? String(msg.from?.id ?? chatId);

  if (!username) {
    await b.sendMessage(
      chatId,
      `❌ *No username provided!*\n\n` +
      `Usage: \`/analyze <username>\`\n` +
      `Example: \`/analyze cristiano\`\n\n` +
      `Or just type the username directly:\n\`cristiano\``,
      { parse_mode: "Markdown" }
    );
    return;
  }

  const cleanName = username.replace(/^@/, "");
  let loadingMsg: TelegramBot.Message | null = null;

  try {
    loadingMsg = await b.sendMessage(
      chatId,
      `🔍 *Analyzing @${cleanName}...*\n\n⏳ Fetching profile data, please wait a moment.`,
      { parse_mode: "Markdown" }
    );

    const profile = await fetchInstagramProfile(cleanName);

    await db.insert(analysesTable).values({
      username: profile.username,
      fullName: profile.fullName,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      postsCount: profile.postsCount,
      isVerified: profile.isVerified,
      isPrivate: profile.isPrivate,
      isBusinessAccount: profile.isBusinessAccount,
      profilePicUrl: profile.profilePicUrl,
      engagementRate: profile.engagementRate,
      avgLikes: profile.avgLikes,
      avgComments: profile.avgComments,
      accountCategory: profile.accountCategory,
      externalUrl: profile.externalUrl,
      requestedBy,
    });

    if (loadingMsg) {
      try { await b.deleteMessage(chatId, loadingMsg.message_id); } catch {}
    }
    await b.sendMessage(chatId, buildAnalysisMessage(profile), { parse_mode: "Markdown" });
  } catch (err: any) {
    if (loadingMsg) {
      try { await b.deleteMessage(chatId, loadingMsg.message_id); } catch {}
    }
    const msg403 = (err.message ?? "").includes("403") || (err.message ?? "").includes("access denied");
    await b.sendMessage(
      chatId,
      `❌ *Could not analyze @${cleanName}*\n\n` +
      `${msg403
        ? "⚠️ API access error. The service is temporarily unavailable."
        : `Reason: ${err?.message ?? "Unknown error"}\n\n` +
          `Possible causes:\n` +
          `• Account doesn't exist\n` +
          `• Account is private\n` +
          `• API rate limit reached\n\n` +
          `Please try again in a moment.`}`,
      { parse_mode: "Markdown" }
    );
    console.error(`[Bot] Error analyzing @${cleanName}:`, err?.message ?? err);
  }
}

export async function startBot(): Promise<{ success: boolean; message: string }> {
  if (botRunning && bot) {
    return { success: false, message: "Bot is already running" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { success: false, message: "TELEGRAM_BOT_TOKEN is not set" };
  }

  try {
    await clearTelegramConflicts(token);

    bot = new TelegramBot(token, {
      polling: {
        interval: 300,
        autoStart: false,
        params: { timeout: 10, allowed_updates: JSON.stringify(["message", "callback_query"]) as any },
      },
    });

    const me = await bot.getMe();
    botInfo = { first_name: me.first_name, username: me.username };

    registerHandlers(bot);
    await bot.startPolling();

    botRunning = true;
    botStartTime = new Date();
    console.log(`✅ Telegram bot started: @${me.username}`);
    return { success: true, message: `Bot @${me.username} is now live` };
  } catch (err: any) {
    botRunning = false;
    bot = null;
    botStartTime = null;
    console.error("[Bot] Failed to start:", err?.message);
    return { success: false, message: err?.message ?? "Failed to start bot" };
  }
}

export async function stopBot(): Promise<{ success: boolean; message: string }> {
  if (!botRunning || !bot) {
    return { success: false, message: "Bot is not running" };
  }
  try {
    await bot.stopPolling();
    bot = null;
    botRunning = false;
    botStartTime = null;
    console.log("🛑 Telegram bot stopped");
    return { success: true, message: "Bot stopped successfully" };
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Failed to stop bot" };
  }
}

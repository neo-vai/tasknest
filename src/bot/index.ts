import "dotenv/config";
import { Bot, GrammyError, HttpError } from "grammy";
import { ProxyAgent, fetch } from "undici";
import { createServer } from "http";
import { prisma } from "@/lib/prisma";

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

const LINK_SECRET = process.env.TELEGRAM_LINK_SECRET || "";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const INTERNAL_PORT = Number(process.env.TELEGRAM_BOT_INTERNAL_PORT) || 4000;

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || undefined;

const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

if (proxyUrl) {
  console.log("Using proxy:", proxyUrl);
}

const bot = new Bot(botToken, {
  client: {
    fetch: (url: any, init?: any): Promise<any> => {
      return fetch(url, {
        ...init,
        dispatcher,
      }) as any;
    },
  },
});

bot.use(async (ctx, next) => {
  console.log("Update received:", ctx.update.update_id, ctx.message?.text ?? ctx.update);
  await next();
});

bot.command("ping", async (ctx) => {
  await ctx.reply("pong");
});

bot.command("start", async (ctx) => {
  await ctx.reply(
    `👋 Welcome to TaskNest!\n` +
    `Manage projects and tasks with your team in a simple, collaborative workspace.\n` +
    `🚀 Visit ${BASE_URL} to get started.`
  );
});

bot.command("links", async (ctx) => {
  const chatId = String(ctx.chat.id);
  try {
    const users = await prisma.user.findMany({
      where: { telegramChatId: chatId },
      select: { id: true, email: true, name: true },
    });

    if (users.length === 0) {
      await ctx.reply("ℹ️ No TaskNest accounts are linked to this Telegram chat.");
      return;
    }

    const lines = users.map((u, i) => {
      const display = u.name ? `${u.name} (${u.email})` : u.email;
      return `${i + 1}. ${display}`;
    });

    await ctx.reply(`🔗 Linked accounts:\n\n${lines.join("\n")}`);
  } catch (error) {
    console.error("Failed to fetch linked accounts for chat", chatId, error);
    await ctx.reply("❌ Could not retrieve linked accounts at the moment. Please try again later.");
  }
});

bot.command("unlink", async (ctx) => {
  const chatId = String(ctx.chat.id);
  const message = ctx.message?.text || "";
  const parts = message.split(/\s+/);
  const emailArg = parts.length >= 2 ? parts[1] : null;

  try {
    const linkedUsers = await prisma.user.findMany({
      where: { telegramChatId: chatId },
      select: { id: true, email: true, name: true },
    });

    if (linkedUsers.length === 0) {
      await ctx.reply("ℹ️ No TaskNest accounts are linked to this Telegram chat.");
      return;
    }

    if (linkedUsers.length === 1) {
      const user = linkedUsers[0];
      await prisma.user.update({
        where: { id: user.id },
        data: { telegramChatId: null, telegramLinkedAt: null },
      });
      const display = user.name ? `${user.name} (${user.email})` : user.email;
      await ctx.reply(`✅ Unlinked account: ${display}`);
      return;
    }

    if (!emailArg) {
      const accountsList = linkedUsers.map((u, i) => `${i + 1}. ${u.email}`).join("\n");
      await ctx.reply(
        `You have multiple accounts linked. Please specify the email to unlink.\n\nUsage: /unlink <email>\n\nLinked accounts:\n${accountsList}`
      );
      return;
    }

    const userToUnlink = linkedUsers.find(
      (u) => u.email.toLowerCase() === emailArg.toLowerCase()
    );

    if (!userToUnlink) {
      await ctx.reply(`❌ No linked account found with email "${emailArg}". Use /links to see your linked accounts.`);
      return;
    }

    await prisma.user.update({
      where: { id: userToUnlink.id },
      data: { telegramChatId: null, telegramLinkedAt: null },
    });
    const display = userToUnlink.name ? `${userToUnlink.name} (${userToUnlink.email})` : userToUnlink.email;
    await ctx.reply(`✅ Unlinked account: ${display}`);
  } catch (error) {
    console.error("Unlink error for chat", chatId, error);
    await ctx.reply("❌ Could not unlink the account. Please try again later.");
  }
});

bot.command("link", async (ctx) => {
  const message = ctx.message?.text || "";
  const parts = message.split(/\s+/);

  if (parts.length !== 2 || parts[1].length !== 6) {
    await ctx.reply("Usage: /link <6-character code>");
    return;
  }

  const code = parts[1].toUpperCase();
  const chatId = ctx.chat.id;

  try {
    const res = await globalThis.fetch(`${BASE_URL}/api/bot/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINK_SECRET}`,
      },
      body: JSON.stringify({ code, chatId }),
    });

    const data = (await res.json()) as {
      error?: string;
    };

    if (res.ok) {
      await ctx.reply("✅ Account linked successfully!");
    } else {
      await ctx.reply(`❌ ${data.error || "Linking failed"}`);
    }
  } catch (err) {
    console.error("Link error", err);
    await ctx.reply("❌ Internal error, please try later.");
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("GrammyError:", e.description);
  } else if (e instanceof HttpError) {
    console.error("HttpError:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/send") {
    const auth = req.headers.authorization || "";
    const secret = `Bearer ${LINK_SECRET}`;
    if (!LINK_SECRET || auth !== secret) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const { chatId, text } = JSON.parse(body);
        if (!chatId || !text || typeof chatId !== "number" || typeof text !== "string") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid payload" }));
          return;
        }

        await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error("Internal send error", err);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Telegram API failed" }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(INTERNAL_PORT, "127.0.0.1", () => {
  console.log(`Internal send API listening on 127.0.0.1:${INTERNAL_PORT}`);
});

bot.api
  .getMe()
  .then((me) => {
    console.log(`Bot verified: @${me.username}`);
  })
  .catch((err) => {
    console.error("Failed to verify token:", err);
    process.exit(1);
  });

bot.start();

console.log("Bot started");
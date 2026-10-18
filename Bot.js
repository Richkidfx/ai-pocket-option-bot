const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.error("Missing BOT_TOKEN environment variable.");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

let offset = 0;
let autoMode = false;
const history = [];

async function telegram(method, body = {}) {
  const response = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || "Telegram API error");
  }

  return data.result;
}

async function sendMessage(chatId, text) {
  return telegram("sendMessage", {
    chat_id: chatId,
    text
  });
}

async function handleMessage(message) {
  if (!message.text || !message.chat) return;

  const chatId = message.chat.id;
  const command = message.text.trim().split(/\s+/)[0].split("@")[0];

  switch (command) {
    case "/start":
      await sendMessage(
        chatId,
        "🤖 AI Pocket Option Bot\n\n" +
        "Welcome! Your Telegram bot is running.\n\n" +
        "/analyze - Demo market analysis\n" +
        "/signals - View sample signals\n" +
        "/autotrade - View automation status\n" +
        "/stop - Disable simulated auto mode\n" +
        "/history - View recent records\n\n" +
        "Real trading is not connected yet."
      );
      break;

    case "/analyze":
      await sendMessage(
        chatId,
        "📊 Market analysis is not connected yet.\n\n" +
        "We need a reliable market-data source before " +
        "generating genuine trading signals."
      );
      break;

    case "/signals":
      await sendMessage(
        chatId,
        "📈 No verified trading signals yet.\n\n" +
        "This bot will not invent market prices or " +
        "present sample signals as real opportunities."
      );
      break;

    case "/autotrade":
      await sendMessage(
        chatId,
        "⚠️ Real automated trading is not available yet.\n\n" +
        "Pocket Option integration and risk controls " +
        "must be verified before enabling real trades."
      );
      break;

    case "/stop":
      autoMode = false;
      await sendMessage(
        chatId,
        "🛑 Simulated auto mode is OFF.\n" +
        "No real trades are being placed by this bot."
      );
      break;

    case "/history":
      await sendMessage(
        chatId,
        history.length
          ? history.slice(-10).join("\n")
          : "No trading records yet."
      );
      break;

    default:
      await sendMessage(
        chatId,
        "Unknown command. Send /start to see the menu."
      );
  }
}

async function main() {
  console.log("Telegram bot started.");

  while (true) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message"]
      });

      for (const update of updates) {
        offset = update.update_id + 1;

        try {
          await handleMessage(update.message);
        } catch (error) {
          console.error("Message error:", error.message);
        }
      }
    } catch (error) {
      console.error("Polling error:", error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

main();

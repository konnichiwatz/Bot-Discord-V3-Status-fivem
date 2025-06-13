const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const config = require("./config.json");
const { initStatusHandler, checkServerStatus } = require("./utils/statusHandler");
const startApiServer = require("./api");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);

  initStatusHandler(client);

  if (config.ENABLE_AUTO_CHECK) {
    console.log("🔁 เริ่มเช็คสถานะเซิร์ฟเวอร์อัตโนมัติ");
    checkServerStatus();
    setInterval(checkServerStatus, config.CHECK_INTERVAL || 60000);
  } else {
    console.log("🛑 ปิดระบบตรวจสอบสถานะอัตโนมัติ (Webhook Mode Only)");
  }

  startApiServer();
});

client.login(config.BOT_TOKEN).then(() => {
  console.log("✅ Discord bot logged in successfully.");
}).catch(err => {
  console.error("❌ Discord bot login failed:", err);
  process.exit(1);
});

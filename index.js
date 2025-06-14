const { Client, GatewayIntentBits, Partials } = require("discord.js");
const config = require("./config.json");
const { initStatusHandler, checkServerStatus } = require("./utils/statusHandler");
const { setClient, startApiServer } = require("./api");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);

  initStatusHandler(client);
  setClient(client);
  startApiServer();

  if (config.ENABLE_AUTO_CHECK) {
    console.log("🔁 เริ่มเช็คสถานะเซิร์ฟเวอร์อัตโนมัติ");
    checkServerStatus();
    setInterval(checkServerStatus, config.CHECK_INTERVAL || 60000);
  } else {
    console.log("🛑 ปิดระบบตรวจสอบสถานะอัตโนมัติ (Webhook Mode Only)");
  }
});

client.login(config.BOT_TOKEN)
  .then(() => console.log("✅ Discord bot logged in successfully."))
  .catch(err => {
    console.error("❌ Discord bot login failed:", err);
    process.exit(1);
  });

const { EmbedBuilder } = require("discord.js");
const FiveM = require("fivem-stats");
const config = require("../config.json");

const server = new FiveM.Stats(`${config.SERVER_IP}:${config.SERVER_PORT || 30120}`);
let clientInstance = null;

let lastStatus = null;
let lastWebhookTimestamp = 0;

function initStatusHandler(client) {
  clientInstance = client;
}

function getEmbed(statusText) {
  const embed = new EmbedBuilder()
    .setThumbnail(config.SERVER_LOGO);

  switch (statusText) {
    case "restart":
      embed
        .setColor(config.EMBED_COLOR_RESTART) // ส้ม
        .setTitle("🔁 กำลังรีสตาร์ทเซิร์ฟเวอร์")
        .setDescription(`งดเข้าเซิร์ฟเวอร์ก่อนประกาศเปิดเซิร์ฟเวอร์\nหากเข้าได้แล้วจะแจ้งให้ทราบอีกครั้ง\n\n**Server Status:** \`🔁 Restart 🔁\``)
        .setImage("https://i.ibb.co/gVfDpZK/restart.jpg");
      break;
    case "online":
      embed
        .setColor(config.EMBED_COLOR_ONLINE) // เขียว
        .setTitle("✅ TEST RESTART SERVER")
        .setDescription(`Server เปิดให้บริการปกติแล้วค่ะ\nกด F8 เพื่อเปิดหน้าต่าง Console นำ IP ด้านล่างวางได้เลย\n\`\`\`connect ${config.SERVER_IP}:${config.SERVER_PORT}\`\`\`\n**เวลารีเซิร์ฟเวอร์**\n\`\`\`${config.RESTART_TIMES}\`\`\`\n**Server Status:** \`🟢 Online 🟢\``)
        .setImage("https://i.ibb.co/W3S3KWC/online.jpg");
      break;
    case "maintenance":
      embed
        .setColor(config.EMBED_COLOR_MAINTENANCE) // เหลือง
        .setTitle("🛠️ Server Maintenance")
        .setDescription(`กำลังทดสอบระบบ งดเข้าเซิร์ฟเวอร์ก่อนประกาศเปิดเซิร์ฟเวอร์\n\n**Server Status:** \`⚠️ Maintenance ⚠️\``)
        .setImage("https://i.ibb.co/SKvGmgW/maintenance1.jpg");
      break;
    case "offline":
    default:
      embed
        .setColor(config.EMBED_COLOR_OFFLINE) // แดง
        .setTitle("❌ Server Offline")
        .setDescription(`กำลังปรับปรุงเซิร์ฟเวอร์\nห้ามเข้าก่อนประกาศเปิดเซิร์ฟเวอร์\n\n**Server Status:** \`🔴 Offline 🔴\``)
        .setImage("https://i.ibb.co/zf4Nbnr/maintenance2.jpg");
      break;
  }

  embed.setFooter({
    text: `Jimmy Bot v.3 - ${new Date().toLocaleString("th-TH")}`,
  });

  return embed;
}

async function sendStatusUpdate(statusText) {
  const embed = getEmbed(statusText);

  if (!clientInstance) {
    console.error("❌ clientInstance ยังไม่ได้รับการเซต! ตรวจสอบ initStatusHandler(client)");
    return;
  }

  try {
    const channel = await clientInstance.channels.fetch(config.CHANNEL_ID);
    if (!channel) {
      console.error("❌ ไม่พบ Channel ด้วย ID นี้:", config.CHANNEL_ID);
      return;
    }

    await channel.send({
      content: `<@&${config.STATUS_ROLE_ID}>`,
      embeds: [embed],
    });
    console.log(`📣 ส่งสถานะไปยัง Discord → ${statusText}`);
  } catch (err) {
    console.error("❌ ส่ง embed ไม่สำเร็จ:", err);
  }
}

async function getStatus() {
  try {
    const isOnline = (await server.getServerStatus()).online;
    return isOnline ? "online" : "offline";
  } catch (err) {
    console.error("⚠️ Error getting server status:", err.message);
    return "offline";
  }
}

async function checkServerStatus() {
  const now = Date.now();
  if (now - lastWebhookTimestamp < 30000) {
    console.log("⏳ Skipped polling check (recent webhook received)");
    return;
  }

  const currentStatus = await getStatus();
  if (currentStatus !== lastStatus) {
    lastStatus = currentStatus;
    await sendStatusUpdate(currentStatus);
  } else {
    console.log(`✅ No change - Server still: ${currentStatus}`);
  }
}

async function handleWebhookStatusUpdate(status) {
  if (status !== lastStatus) {
    lastStatus = status;
    lastWebhookTimestamp = Date.now();
    await sendStatusUpdate(status);

    // ถ้าเป็น restart → ตั้ง Timer เช็ค offline อีกครั้งใน 10 วินาที
    if (status === "restart") {
      setTimeout(() => {
        console.log("🔍 Checking if server went offline after restart...");
        checkServerStatus(); // จะเปลี่ยนสถานะเป็น offline ถ้าดับไปแล้วจริง
      }, 10000);
    }

    return { message: `Status updated to ${status}` };
  } else {
    console.log(`[Webhook] Status already ${status}, no update sent.`);
    return { message: `Status already ${status}` };
  }
}

module.exports = {
  initStatusHandler,
  checkServerStatus,
  handleWebhookStatusUpdate
};

const { EmbedBuilder, ActivityType } = require("discord.js");
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
        .setImage("https://cdn-icons-png.flaticon.com/512/16265/16265301.png");
      break;
    case "online":
      embed
        .setColor(config.EMBED_COLOR_ONLINE) // เขียว
        .setTitle("✅ TEST RESTART SERVER")
        .setDescription(`Server เปิดให้บริการปกติแล้วค่ะ\nกด F8 เพื่อเปิดหน้าต่าง Console นำ IP ด้านล่างวางได้เลย\n\`\`\`connect ${config.SERVER_IP}:${config.SERVER_PORT}\`\`\`\n**เวลารีเซิร์ฟเวอร์**\n\`\`\`${config.RESTART_TIMES}\`\`\`\n**Server Status:** \`🟢 Online 🟢\``)
        .setImage("https://cdn-icons-png.flaticon.com/512/11433/11433365.png");
      break;
    case "maintenance":
      embed
        .setColor(config.EMBED_COLOR_MAINTENANCE) // เหลือง
        .setTitle("🛠️ Server Maintenance")
        .setDescription(`กำลังทดสอบระบบ งดเข้าเซิร์ฟเวอร์ก่อนประกาศเปิดเซิร์ฟเวอร์\n\n**Server Status:** \`⚠️ Maintenance ⚠️\``)
        .setImage("https://cdn-icons-png.flaticon.com/512/18208/18208249.png");
      break;
    case "offline":
    default:
      embed
        .setColor(config.EMBED_COLOR_OFFLINE) // แดง
        .setTitle("❌ Server Offline")
        .setDescription(`กำลังปรับปรุงเซิร์ฟเวอร์\nห้ามเข้าก่อนประกาศเปิดเซิร์ฟเวอร์\n\n**Server Status:** \`🔴 Offline 🔴\``)
        .setImage("https://cdn-icons-png.flaticon.com/512/448/448942.png");
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

    if (status === "restart") {
      setTimeout(() => {
        console.log("🔍 Checking if server went offline after restart...");
        checkServerStatus();
      }, 10000);
    }

    return { message: `Status updated to ${status}` };
  } else {
    console.log(`[Webhook] Status already ${status}, no update sent.`);
    return { message: `Status already ${status}` };
  }
}

async function updateBotStatus(client, status) {
  let activity = {
    type: ActivityType.Custom,
    name: 'Custom Status',
    state: ''
  };

  switch (status.toLowerCase()) {
    case 'online':
      activity.state = '🟢 Server status: Online';
      break;
    case 'offline':
      activity.state = '🔴 Server status: Offline';
      break;
    case 'restart':
      activity.state = '🔁 Server status: Restarting';
      break;
    case 'maintenance':
      activity.state = '🛠️ Server status: Maintenance';
      break;
    default:
      activity.state = '❓ Unknown status';
  }

  try {
    await client.user.setPresence({ activities: [activity], status: 'online' });
    console.log(`✅ Updated bot presence to: ${activity.state}`);
  } catch (error) {
    console.error('❌ Error updating bot presence:', error);
  }
}

module.exports = {
  initStatusHandler,
  checkServerStatus,
  handleWebhookStatusUpdate,
  updateBotStatus,
}

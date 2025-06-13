const express = require("express");
const config = require("./config.json");
const { handleWebhookStatusUpdate } = require("./utils/statusHandler");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

app.post('/status', async (req, res) => {
  try {
    const status = req.body.status;
    console.log(`📩 รับสถานะจาก FiveM: ${status}`);

    const result = await handleWebhookStatusUpdate(status);

    console.log(`✅ ${result.message}`);
    return res.json({ success: true, message: result.message });
  } catch (error) {
    console.error(`❌ ส่งสถานะไป Discord ไม่สำเร็จ:`, error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'ส่งข้อมูลล้มเหลว', detail: error.message });
    }
  }
});

function startApiServer() {
  const PORT = config.PORT_API;
  app.listen(PORT, () => {
    console.log(`🌐 HTTP Webhook Server running at http://localhost:${PORT}/status`);
  });
}

module.exports = startApiServer;

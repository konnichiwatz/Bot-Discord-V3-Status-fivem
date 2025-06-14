// api.js
const express = require("express");
const config = require("./config.json");
const { handleWebhookStatusUpdate, updateBotStatus } = require("./utils/statusHandler");

let clientRef = null;

function setClient(client) {
  clientRef = client;
}

function startApiServer() {
  const app = express();
  const PORT = config.PORT_API || 3000;

  app.use(express.json());
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  app.post('/status', async (req, res) => {
    const status = req.body.status;

    if (!status) {
      return res.status(400).json({ error: 'Missing status' });
    }

    console.log(`📩 รับสถานะจาก FiveM: ${status}`);

    try {
      if (!clientRef) {
        return res.status(500).json({ error: 'Bot client not initialized yet' });
      }

      updateBotStatus(clientRef, status);
      const result = await handleWebhookStatusUpdate(status);

      console.log(`✅ ${result.message}`);
      return res.status(200).json({ success: true, message: result.message });

    } catch (error) {
      console.error(`❌ ส่งสถานะไป Discord ไม่สำเร็จ:`, error);
      return res.status(500).json({ error: 'Failed to process status', detail: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`🌐 HTTP Webhook Server running at http://localhost:${PORT}/status`);
  });
}

module.exports = { setClient, startApiServer };

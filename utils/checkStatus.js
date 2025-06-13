const axios = require("axios");
const config = require("../config.json");
const statusHandler = require("./statusHandler");

let lastStatus = null;

async function checkServerStatus() {
  try {
    const response = await axios.get(config.SERVER_URL + "/info.json", {
      timeout: 5000,
    });

    if (response.status === 200) {
      if (lastStatus !== "online") {
        statusHandler.sendStatusToDiscord("online");
        lastStatus = "online";
      } else {
        console.log("✅ No change - Server still: online");
      }
    }
  } catch (error) {
    if (lastStatus !== "offline") {
      statusHandler.sendStatusToDiscord("offline");
      lastStatus = "offline";
    } else {
      console.log("✅ No change - Server still: offline");
    }
  }
}

module.exports = checkServerStatus;

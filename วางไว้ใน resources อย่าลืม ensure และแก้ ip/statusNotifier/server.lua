local webhookURL = "http://localhost:30120/status"
local currentStatus = nil

local function sendStatusToBot(status, retry)
    retry = retry or 0
    print("[Status Debug] Sending status to bot:", status)

    PerformHttpRequest(
        webhookURL,
        function(httpCode, response, headers)
            if httpCode == 200 then
                print("[Status Update] ✅ Status sent successfully:", status)
            elseif retry < 3 then
                print(("[Status Update] ❌ Failed (HTTP %s), retrying... (%d)"):format(httpCode, retry+1))
                Wait(2000)
                sendStatusToBot(status, retry + 1)
            else
                print(("[Status Update] ❌ Failed to send status '%s' | HTTP Code: %s"):format(status, tostring(httpCode)))
            end
        end,
        "POST",
        json.encode({ status = status }),
        { ["Content-Type"] = "application/json" }
    )
end

local function sendStatusOnce(status)
    print("[Status Debug] currentStatus =", tostring(currentStatus), "Requested status =", status)
    if currentStatus == status then
        print("[Status Debug] Status '" .. status .. "' ถูกส่งไปแล้ว ไม่ส่งซ้ำ")
        return
    end
    currentStatus = status
    sendStatusToBot(status)
    
    if status == "offline" then
        currentStatus = nil
    end
end

RegisterNetEvent("txAdmin:events:scheduledRestart")
AddEventHandler("txAdmin:events:scheduledRestart", function(data)
    print("[Webhook] Sending restart status to Discord bot (scheduled)")
    sendStatusOnce("restart")
end)

RegisterNetEvent("txAdmin:events:serverShuttingDown")
AddEventHandler("txAdmin:events:serverShuttingDown", function(data)
    print("[Webhook] Sending offline status to Discord bot (server shutting down)")
    sendStatusOnce("offline")
end)

AddEventHandler("onResourceStop", function(resourceName)
    print("[Event] onResourceStop called for:", resourceName)
    if GetCurrentResourceName() == resourceName then
        print("[ServerStatus] 🔴 Server is shutting down... Sending 'offline' status")
        sendStatusOnce("offline")
    end
end)

CreateThread(function()
    Wait(2000)
    print("[ServerStatus] 🟢 Server is now online")
    sendStatusOnce("online")
end)

RegisterCommand("setstatus", function(source, args)
    if source ~= 0 then
        TriggerClientEvent("chat:addMessage", source, {
            args = { "^1[Error]", "ใช้ได้เฉพาะจาก Server Console เท่านั้น" }
        })
        return
    end

    local status = args[1]
    local allowedStatuses = {
        online = true,
        offline = true,
        restart = true,
        maintenance = true,
    }

    if not status or not allowedStatuses[status:lower()] then
        print("❌ Invalid status. ใช้ได้เฉพาะ: online | offline | restart | maintenance")
        return
    end

    print("[ServerStatus] ⌨️ Console command used to send:", status:lower())
    sendStatusOnce(status:lower())
end, false)

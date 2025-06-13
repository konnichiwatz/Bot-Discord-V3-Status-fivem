คำสั่งใช้งาน

setstatus maintenance
setstatus offline
setstatus online
setstatus restart

แก้ไข IP address หรือ host ที่ใช้เรียกหากเปลี่ยน (เช่น webhook URL จาก localhost เป็น IP ใหม่)
ตรวจสอบว่าค่าใน config.json ถูกต้องสำหรับเครื่องใหม่ เช่น

SERVER_IP, CHANNEL_ID, TOKEN บอท Discord, พอร์ตที่รันเซิร์ฟเวอร์ (ถ้าเปลี่ยน)
ถ้า webhook อยู่บนเครื่องใหม่ ตรวจสอบให้แน่ใจว่า URL ตรงกัน

รัน Discord Bot บนเครื่องใหม่ ตรวจสอบการเชื่อมต่อและการส่งสถานะ
ตรวจสอบ log ทั้งฝั่ง Bot และ FiveM ว่ามี error หรือไม่
ทดสอบคำสั่ง

ตรวจสอบฟีดแบค
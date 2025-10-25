import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { handleDifyStreaming } from "./difyHandler.js";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 📩 Nhận webhook từ Zalo
app.post("/zalo/webhook", (req, res) => {
    const payload = req.body;
    const text = payload?.message?.text || "";
    const userId = payload?.sender?.id || "unknown";

    console.log("📩 Nhận từ Zalo:", text, userId);

    // ✅ Trả ngay 200 OK để Zalo không timeout
    res.sendStatus(200);

    // ✅ Xử lý streaming ở background
    handleDifyStreaming(userId, text);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
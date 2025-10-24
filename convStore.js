import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONV_FILE = path.join(__dirname, "convMap.json");

// Đọc dữ liệu cũ
let convMap = {};
if (fs.existsSync(CONV_FILE)) {
    try {
        convMap = JSON.parse(fs.readFileSync(CONV_FILE, "utf8"));
        console.log("✅ Đã tải conversation map từ file:", CONV_FILE);
    } catch {
        convMap = {};
        console.warn("⚠️ Không đọc được convMap.json, tạo mới.");
    }
}

// Lưu lại file
function saveConvMap() {
    fs.writeFileSync(CONV_FILE, JSON.stringify(convMap, null, 2));
    console.log("💾 Đã lưu convMap vào file.");
}

export function getConversationId(userId) {
    return convMap[userId] || "";
}

export function saveConversationId(userId, conversationId) {
    convMap[userId] = conversationId;
    saveConvMap();
}
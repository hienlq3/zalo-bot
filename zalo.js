import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export async function sendZaloMessage(userId, text) {
    const url = process.env.ZALO_API_URL;
    const accessToken = process.env.ZALO_ACCESS_TOKEN;

    const data = {
        recipient: { user_id: userId },
        message: { text },
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                access_token: accessToken,
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log("✅ Trả lời Zalo:", result);
    } catch (err) {
        console.error("❌ Lỗi gửi Zalo:", err);
    }
}
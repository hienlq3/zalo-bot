import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function sendZaloMessage(userId, text) {
    const url = process.env.ZALO_API_URL || "https://openapi.zalo.me/v3.0/oa/message/cs";
    console.log("Sending Zalo message to URL:", url);
    const accessToken = process.env.ZALO_ACCESS_TOKEN;
    console.log("Sending Zalo message to accessToken:", accessToken);

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
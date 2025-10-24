import fetch from "node-fetch";
import { sendZaloMessage } from "./zalo.js";
import { getConversationId, saveConversationId } from "./convStore.js";

export async function handleDifyStreaming(userId, text) {
    const conversationId = getConversationId(userId) || "";

    try {
        const difyResponse = await fetch("http://171.244.139.204/v1/chat-messages", {
            method: "POST",
            headers: {
                Authorization: "Bearer app-kWEEUSubWCZuPYoAyiV2gxbG",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: {},
                query: text,
                response_mode: "streaming",
                conversation_id: conversationId,
                user: userId,
                files: [],
            }),
        });

        let fullAnswer = "";

        difyResponse.body.on("data", (chunk) => {
            const str = chunk.toString();
            const lines = str.split("\n");

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const jsonStr = line.substring(6);
                if (jsonStr === "[DONE]") continue;

                try {
                    const event = JSON.parse(jsonStr);
                    const eventType = event.event;

                    if (eventType === "message" || eventType === "agent_message") {
                        fullAnswer += event.answer || "";
                    } else if (eventType === "message_end") {
                        const newConvId = event.conversation_id || conversationId;
                        saveConversationId(userId, newConvId);
                        console.log(`✅ Hoàn tất nhận dữ liệu, lưu conversationId cho user ${userId}`);
                    } else if (eventType === "error") {
                        console.error("❌ Lỗi từ Dify:", event);
                    }
                } catch {
                    console.warn("⚠️ Không parse được dòng:", line);
                }
            }
        });

        difyResponse.body.on("end", async () => {
            console.log("🤖 Câu trả lời đầy đủ:", fullAnswer);
            await sendZaloMessage(userId, fullAnswer);
        });
    } catch (err) {
        console.error("❌ Lỗi gọi Dify:", err);
    }
}
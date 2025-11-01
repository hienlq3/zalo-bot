import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// 🔧 Hàm lưu token mới vào file .env
function updateEnvToken(key, value) {
    const envPath = ".env";
    let envContent = fs.readFileSync(envPath, "utf8");

    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
        envContent += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, envContent);
    process.env[key] = value; // cập nhật biến môi trường hiện tại
}

// 🔄 Hàm refresh token
async function refreshAccessToken() {
    console.log("🔁 Đang làm mới Zalo Access Token...");

    const params = new URLSearchParams();
    params.append("app_id", process.env.ZALO_APP_ID);
    params.append("refresh_token", process.env.ZALO_REFRESH_TOKEN);
    params.append("grant_type", "refresh_token");

    const res = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "secret_key": process.env.ZALO_APP_SECRET,
        },
        body: params.toString(),
    });

    const data = await res.json();

    if (data.access_token) {
        console.log("✅ Lấy access token mới thành công");
        updateEnvToken("ZALO_ACCESS_TOKEN", data.access_token);

        if (data.refresh_token) {
            console.log("🔄 Lưu refresh token mới");
            updateEnvToken("ZALO_REFRESH_TOKEN", data.refresh_token);
        }

        return data.access_token;
    } else {
        throw new Error("❌ Refresh token thất bại: " + JSON.stringify(data));
    }
}

// 💬 Hàm gửi tin nhắn
export async function sendZaloMessage(userId, text) {
    const url = process.env.ZALO_API_URL;
    let accessToken = process.env.ZALO_ACCESS_TOKEN;

    const data = {
        recipient: { user_id: userId },
        message: { text },
    };

    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                access_token: accessToken,
            },
            body: JSON.stringify(data),
        });

        let result = await res.json();

        // ⚠️ Nếu token hết hạn (-216), tự refresh và gửi lại
        if (result.error === -216) {
            console.warn("⚠️ Token hết hạn, đang refresh...");
            accessToken = await refreshAccessToken();

            res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    access_token: accessToken,
                },
                body: JSON.stringify(data),
            });

            result = await res.json();
        }

        console.log("✅ Kết quả gửi tin:", result);
        return result;

    } catch (err) {
        console.error("❌ Lỗi gửi tin nhắn Zalo:", err);
        throw err;
    }
}
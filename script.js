/**
 * ==========================================
 * 🔑 API KEY 植入位置說明
 * ==========================================
 * 1. 請前往 https://aistudio.google.com/ 申請免費的 Gemini API Key。
 * 2. 拿到後，將下方引號內的文字換成你的 API Key。
 */
const CONFIG = {
    // 1. 確認這裡貼的是你剛剛複製的 AIza... 開頭的 Key
    GEMINI_API_KEY: "AIzaSyB0ZZsfM4IfFRhBcqwXjOGk0MmlDt_u17w", 

    // 2. 注意：網址結尾要加上 :generateContent，且中間是 v1beta
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
};

async function askAIAssistant() {
    const inputField = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');
    const userText = inputField.value.trim();

    if (!userText) return;

    // 1. 顯示使用者訊息
    appendMessage("user", `<strong>你:</strong> ${userText}`);
    inputField.value = ""; // 清空輸入
    sendBtn.disabled = true; // 防止連續點擊

    // 2. 建立 AI 思考中的暫存區塊
    const loadingId = appendMessage("ai", "<strong>AI 助手:</strong> 正在為您規劃配置中...");

    try {
        // 3. 發送 API 請求
        const response = await fetch(`${CONFIG.API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `你是一位電腦硬體專家。使用者需求：${userText}。
                        請根據需求推薦一份包含 CPU、主機板、顯示卡、記憶體、電源的配置單，
                        並簡單說明選擇理由。請用繁體中文回答，並使用換行讓排版整齊。` 
                    }]
                }]
            })
        });

        const data = await response.json();

        // 檢查是否有錯誤回傳
        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiResponse = data.candidates[0].content.parts[0].text;

        // 4. 更新 AI 回覆內容（將 \n 換成網頁的換行符號 <br>）
        updateMessage(loadingId, `<strong>AI 助手:</strong><br>${aiResponse.replace(/\n/g, '<br>')}`);

    } catch (error) {
        console.error("發生錯誤:", error);
        updateMessage(loadingId, "<strong>AI 助手:</strong> 抱歉，目前無法連線到 AI 大腦。請確認 API Key 是否填寫正確，或稍後再試。");
    } finally {
        sendBtn.disabled = false;
        // 捲動到底部
        const chatBox = document.getElementById('chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

/**
 * 輔助函式：新增訊息到畫面
 */
function appendMessage(role, htmlContent) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement("div");
    const id = "msg-" + Date.now();
    msgDiv.id = id;
    msgDiv.className = `message ${role}`;
    msgDiv.innerHTML = htmlContent;
    chatMessages.appendChild(msgDiv);
    
    // 自動捲動
    document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
    return id;
}

/**
 * 輔助函式：修改特定訊息內容
 */
function updateMessage(id, newHtml) {
    const target = document.getElementById(id);
    if (target) target.innerHTML = newHtml;
}

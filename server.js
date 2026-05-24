const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===================== 翻译 API =====================
app.post("/api/translate", async (req, res) => {
  const { apiUrl, model, apiKey, messages } = req.body;

  if (!apiUrl || !model || !apiKey) {
    return res.status(400).json({ error: "缺少 API 地址、模型或 API Key" });
  }

  try {
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({
        error: err.error?.message || "HTTP " + resp.status,
      });
    }

    // 流式转发回前端
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const chunk = JSON.parse(data).choices?.[0]?.delta?.content;
          if (chunk) res.write("data: " + JSON.stringify({ content: chunk }) + "\n\n");
        } catch {}
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    res.write("data: " + JSON.stringify({ error: err.message }) + "\n\n");
    res.end();
  }
});

app.listen(PORT, () => {
  console.log("服务已启动，端口:", PORT);
});

# 网页翻译工具

支持多模型的 AI 翻译 Web 应用，部署到 Render 即可使用。

## 功能

- 输入文本，调用 AI API 翻译
- 单词智能识别：原语言解释 → 目标语言翻译 → 实用例句 → 例句翻译
- 句子直接翻译成目标语言
- 支持所有 OpenAI 兼容格式的 API（DeepSeek、Qwen、OpenAI 等）

## 本地运行

```bash
npm install
npm start
```

打开 `http://localhost:3000` 即可使用。

## 部署到 Render

1. 把代码推送到 GitHub/Gitee
2. 在 Render 控制台新建 **Web Service**
3. 关联你的仓库
4. 构建命令留空，启动命令填 `npm start`
5. 部署完成即可访问

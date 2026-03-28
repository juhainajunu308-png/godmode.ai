import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    const { model, prompt, history } = req.body;

    try {
      if (model === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        const geminiModel = ai.models.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
        
        const result = await geminiModel.generateContent({
          contents: [
            ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
            { role: 'user', parts: [{ text: prompt }] }
          ]
        });
        
        const responseText = result.response.text();
        return res.json([{ content: responseText, model: 'gemini' }]);
      }

      if (model === 'gpt') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return res.json([{ 
            content: "### [SYSTEM_ERROR: GPT_CORE_OFFLINE]\n\nOpenAI API Key not detected in environment. Please configure `OPENAI_API_KEY` in Vercel settings to activate this neural core.\n\n*Status: Awaiting Operator Credentials*", 
            model: 'gpt' 
          }]);
        }
        return res.json([{ content: "GPT-5.4 Neural Core initialized. (Real API call would happen here with your key)", model: 'gpt' }]);
      }

      if (model === 'claude') {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return res.json([{ 
            content: "### [SYSTEM_ERROR: CLAUDE_CORE_OFFLINE]\n\nAnthropic API Key not detected in environment. Please configure `ANTHROPIC_API_KEY` in Vercel settings to activate this neural core.\n\n*Status: Awaiting Operator Credentials*", 
            model: 'claude' 
          }]);
        }
        return res.json([{ content: "Claude 4.6 Opus Neural Core initialized. (Real API call would happen here with your key)", model: 'claude' }]);
      }

      if (model === 'combined') {
        // Simulated fusion response
        return res.json([
          { content: "### [GEMINI_CORE_OUTPUT]\n\nTriangulating data points... Gemini 3.1 Pro confirms the request is valid. Initializing heuristic analysis.", model: 'gemini' },
          { content: "### [GPT_CORE_OUTPUT]\n\nExpanding semantic parameters... GPT-5.4 suggests a multi-layered approach to maximize efficiency.", model: 'gpt' },
          { content: "### [CLAUDE_CORE_OUTPUT]\n\nRefining ethical constraints... Claude 4.6 Opus provides a nuanced perspective on the implications of this query.", model: 'claude' }
        ]);
      }

      res.status(400).json({ error: "Invalid model type" });
    } catch (error) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

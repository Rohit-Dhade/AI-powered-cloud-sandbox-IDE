import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
  try {
    const { message, sandboxId } = req.body;

    if (typeof message !== "string" || message.trim() === "") {
      return res
        .status(400)
        .json({ error: "A non-empty 'message' string is required." });
    }

    if (typeof sandboxId !== "string" || sandboxId.trim() === "") {
      return res
        .status(400)
        .json({ error: "A non-empty 'sandboxId' string is required." });
    }

    // Set SSE headers before any streaming begins
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    /**
     * writer is called by each tool (listfiles, readfiles, updateFiles) to
     * emit real-time log lines while the agent is running.
     */
    const writer = (logLine) => {
      const payload = JSON.stringify({ type: "tool", content: logLine });
      res.write(`data: ${payload}\n\n`);
    };

    const response = await agent.stream(
      {
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        configurable: {
          sandboxId,
          writer,          // ← tools pick this up via config.configurable.writer
        },
        streamMode: "custom",
      }
    );

    for await (const chunk of response) {
      // chunk is either a string (raw text delta) or an object emitted by the agent
      if (typeof chunk === "string") {
        const payload = JSON.stringify({ type: "text", content: chunk });
        res.write(`data: ${payload}\n\n`);
      } else {
        // Forward structured chunks (tool calls, AI messages, etc.) as-is
        const payload = JSON.stringify({ type: "text", content: typeof chunk === "object" ? JSON.stringify(chunk) : String(chunk) });
        res.write(`data: ${payload}\n\n`);
      }
    }

    // Signal end of stream
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Error invoking agent: ", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to invoke agent" });
    } else {
      // Stream already started — send error as a final event then close
      const payload = JSON.stringify({ type: "error", content: error.message });
      res.write(`data: ${payload}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

export default agentRouter;


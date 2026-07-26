import express from "express";
import http from "http";                     // <-- ADDED
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

const app = express();
app.use(morgan("combined"));

app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}`;

  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      logLevel: "silent",
      preserveHeaderKeyCase: true,
      xfwd: true,
      timeout: 30000,
      proxyTimeout: 30000,
    });
  }

  return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}:3000`;

  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      logLevel: "silent",
      preserveHeaderKeyCase: true,
      xfwd: true,
      timeout: 30000,
      proxyTimeout: 30000,
    });
  }

  return agentProxies[sandboxId];
}

app.use((req, res, next) => {
  const host = req.headers.host || "";

  const sandboxId = host.split(".")[0];

  if (host.split(".")[1] === "agent") {
    return getAgentProxy(sandboxId)(req, res, next);
  } else if (host.split(".")[1] === "preview") {
    return getProxy(sandboxId)(req, res, next);
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Sandbox router is ready");
});

// ================= ADDED BLOCK START =================
const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host || "";
  const parts = host.split(".");
  const sandboxId = parts[0];
  const type = parts[1]; // "agent" or "preview"

  let proxy;
  if (type === "agent") {
    proxy = getAgentProxy(sandboxId);
  } else if (type === "preview") {
    proxy = getProxy(sandboxId);
  } else {
    socket.destroy();
    return;
  }

  proxy.upgrade(req, socket, head);
});

export default server;   
export { app };          
import { createServer } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { WebSocketServer, type WebSocket } from "ws";

const port = Number(process.env.PORT ?? 8787);
const app = new Hono();
const server = createServer(getRequestListener(app.fetch));

// websocket relay
let host: WebSocket | null = null;
let latestSnapshot: string | null = null;
const clients = new Map<string, WebSocket>();

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);

  if (url.searchParams.get("role") === "host") {
    host = socket;

    for (const clientId of clients.keys()) {
      socket.send(JSON.stringify({ type: "connect", clientId }));
    }

    socket.on("message", (data) => {
      const message = data.toString();
      latestSnapshot = message;

      for (const client of clients.values()) {
        client.send(message);
      }
    });

    socket.on("close", () => {
      host = null;
      latestSnapshot = null;
    });
  } else {
    const clientId = crypto.randomUUID();
    clients.set(clientId, socket);

    host?.send(JSON.stringify({ type: "connect", clientId }));

    if (latestSnapshot !== null) {
      socket.send(latestSnapshot);
    }

    socket.on("message", (data) => {
      const event = JSON.parse(data.toString()) as Record<string, unknown>;
      host?.send(JSON.stringify({ type: "event", clientId, ...event }));
    });

    socket.on("close", () => {
      clients.delete(clientId);
      host?.send(JSON.stringify({ type: "disconnect", clientId }));
    });
  }
});

server.listen(port, () => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
});

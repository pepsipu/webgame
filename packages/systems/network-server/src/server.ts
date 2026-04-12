import type { ElementRegistry } from "@webgames/engine";
import { Element } from "@webgames/engine";

type ServerNetworkEvent = {
  name: string;
  data: unknown;
  clientId: string;
};

type RelayMessage = {
  type: "event" | "connect" | "disconnect";
  clientId: string;
  name?: string;
  data?: unknown;
};

export class ServerNetworkServiceElement extends Element {
  static readonly tag: string = "network";
  static readonly replicated: boolean = false;
  static readonly scriptMethods: readonly string[] = ["pollEvent"];

  private isDestroyed: boolean = false;
  private socket: WebSocket;
  private readonly incomingEvents: ServerNetworkEvent[] = [];

  constructor() {
    super();
    this.socket = this.connect();
  }

  pollEvent(): ServerNetworkEvent | undefined {
    return this.incomingEvents.shift();
  }

  broadcastSnapshot(registry: ElementRegistry): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(registry.getGameSnapshot()));
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    this.socket.close();
  }

  private connect(): WebSocket {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${location.host}/ws?role=host`);

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as RelayMessage;

      this.incomingEvents.push({
        clientId: message.clientId,
        name: message.type === "event" ? message.name! : message.type,
        data: message.type === "event" ? message.data : null,
      });
    });

    socket.addEventListener("close", () => {
      if (this.isDestroyed) {
        return;
      }

      window.setTimeout(() => {
        if (this.isDestroyed) {
          return;
        }

        this.socket = this.connect();
      }, 100);
    });

    return socket;
  }
}

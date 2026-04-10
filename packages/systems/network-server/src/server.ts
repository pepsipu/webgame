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

  #destroyed: boolean = false;
  #socket: WebSocket;
  readonly #incomingEvents: ServerNetworkEvent[] = [];

  constructor() {
    super();
    this.#socket = this.#connect();
  }

  pollEvent(): ServerNetworkEvent | undefined {
    return this.#incomingEvents.shift();
  }

  broadcastSnapshot(registry: ElementRegistry, root: Element): void {
    if (this.#socket.readyState === WebSocket.OPEN) {
      this.#socket.send(JSON.stringify(registry.getSnapshot(root)));
    }
  }

  destroy(): void {
    this.#destroyed = true;
    this.#socket.close();
  }

  #connect(): WebSocket {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${location.host}/ws?role=host`);

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as RelayMessage;

      this.#incomingEvents.push({
        clientId: message.clientId,
        name: message.type === "event" ? message.name! : message.type,
        data: message.type === "event" ? message.data : null,
      });
    });

    socket.addEventListener("close", () => {
      if (this.#destroyed) {
        return;
      }

      window.setTimeout(() => {
        if (this.#destroyed) {
          return;
        }

        this.#socket = this.#connect();
      }, 100);
    });

    return socket;
  }
}

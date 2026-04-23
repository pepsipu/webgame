import type { ElementRegistry } from "@webgames/engine";
import { Element } from "@webgames/engine";

type ServerNetworkEvent = {
  name: string;
  data: unknown;
  clientId: string;
};

type RelayMessage =
  | {
      type: "message";
      clientId: string;
      data: unknown;
    }
  | {
      type: "connect" | "disconnect";
      clientId: string;
    };

type RelayEventData = {
  name: string;
  data: unknown;
};

export class ServerNetworkServiceElement extends Element {
  static readonly tag: string = "network";
  static readonly replicated: boolean = false;

  #socket: WebSocket;
  #incomingEvents: ServerNetworkEvent[] = [];

  constructor() {
    super();
    this.#socket = this.#connect();
  }

  pollEvent(): ServerNetworkEvent | undefined {
    return this.#incomingEvents.shift();
  }

  broadcastSnapshot(registry: ElementRegistry): void {
    if (this.#socket.readyState === WebSocket.OPEN) {
      this.#socket.send(JSON.stringify(registry.getGameSnapshot()));
    }
  }

  destroy(): void {
    this.#socket.close();
  }

  #connect(): WebSocket {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${location.host}/ws?role=host`);

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as RelayMessage;

      if (message.type === "message") {
        const relayEvent = this.#parseRelayEventData(message.data);

        if (relayEvent === null) {
          return;
        }

        this.#incomingEvents.push({
          clientId: message.clientId,
          name: relayEvent.name,
          data: relayEvent.data,
        });
        return;
      }

      this.#incomingEvents.push({
        clientId: message.clientId,
        name: message.type,
        data: null,
      });
    });

    return socket;
  }

  #parseRelayEventData(data: unknown): RelayEventData | null {
    if (typeof data !== "object" || data === null) {
      return null;
    }

    const relayEvent = data as Partial<RelayEventData>;

    if (typeof relayEvent.name !== "string") {
      return null;
    }

    return {
      name: relayEvent.name,
      data: relayEvent.data,
    };
  }
}

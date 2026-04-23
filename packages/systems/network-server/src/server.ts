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

type ServerState = {
  socket: WebSocket;
  incomingEvents: ServerNetworkEvent[];
};

const stateByElement = new WeakMap<HTMLElement, ServerState>();

export class ServerNetworkServiceElement extends Element {
  static readonly tag: string = "network";
  static readonly replicated: boolean = false;

  pollEvent(): ServerNetworkEvent | undefined {
    return getState(this.element, () => this.#connect()).incomingEvents.shift();
  }

  broadcastSnapshot(registry: ElementRegistry): void {
    const state = getState(this.element, () => this.#connect());

    if (state.socket.readyState === WebSocket.OPEN) {
      state.socket.send(JSON.stringify(registry.getGameSnapshot()));
    }
  }

  destroy(): void {
    getState(this.element, () => this.#connect()).socket.close();
  }

  #connect(): WebSocket {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${location.host}/ws?role=host`);
    const element = this.element;

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as RelayMessage;
      const state = getState(element, () => socket);

      if (message.type === "message") {
        const relayEvent = this.#parseRelayEventData(message.data);

        if (relayEvent === null) {
          return;
        }

        state.incomingEvents.push({
          clientId: message.clientId,
          name: relayEvent.name,
          data: relayEvent.data,
        });
        return;
      }

      state.incomingEvents.push({
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

function getState(
  element: HTMLElement,
  createSocket: () => WebSocket,
): ServerState {
  let state = stateByElement.get(element);

  if (state !== undefined) {
    return state;
  }

  state = {
    socket: createSocket(),
    incomingEvents: [],
  };
  stateByElement.set(element, state);
  return state;
}

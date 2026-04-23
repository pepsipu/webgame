import type { ElementRegistry, ElementSnapshot } from "@webgames/engine";
import { Element } from "@webgames/engine";

type ClientState = {
  destroyed: boolean;
  pendingSnapshot?: ElementSnapshot;
  socket: WebSocket;
};

const stateByElement = new WeakMap<HTMLElement, ClientState>();

export class ClientNetworkServiceElement extends Element {
  static readonly tag: string = "network";
  static readonly replicated: boolean = false;

  constructor(element: HTMLElement) {
    super(element);
    getState(this.element, () => this.#createSocket());
  }

  emit(name: string, data: unknown): void {
    const state = getState(this.element, () => this.#createSocket());

    if (state.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    state.socket.send(JSON.stringify({ name, data }));
  }

  applyPendingSnapshot(registry: ElementRegistry): void {
    const state = getState(this.element, () => this.#createSocket());

    if (state.pendingSnapshot === undefined) {
      return;
    }

    const snapshot = state.pendingSnapshot;

    state.pendingSnapshot = undefined;
    registry.loadGameSnapshot(snapshot);
  }

  destroy(): void {
    const state = getState(this.element, () => this.#createSocket());

    state.destroyed = true;
    state.socket.close();
  }

  #getWebSocketUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    return `${protocol}//${window.location.host}/ws`;
  }

  #createSocket(): WebSocket {
    const socket = new WebSocket(this.#getWebSocketUrl());
    const element = this.element;

    socket.addEventListener("message", (event) => {
      getState(element, () => socket).pendingSnapshot = JSON.parse(
        String(event.data),
      ) as ElementSnapshot;
    });
    socket.addEventListener("close", () => {
      const state = getState(element, () => socket);

      if (state.destroyed) {
        return;
      }

      state.pendingSnapshot = {
        tag: "game",
        children: [],
      };
    });

    return socket;
  }
}

function getState(
  element: HTMLElement,
  createSocket: () => WebSocket,
): ClientState {
  let state = stateByElement.get(element);

  if (state !== undefined) {
    return state;
  }

  state = {
    destroyed: false,
    socket: createSocket(),
  };
  stateByElement.set(element, state);
  return state;
}

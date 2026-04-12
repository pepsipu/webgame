import { Element } from "./element";
import type { ElementSnapshot } from "./snapshot";
import { ElementRegistry } from "./element-registry";

export interface EngineSystem {
  install(engine: Engine): void;
}

export type EngineTickHandler = (engine: Engine, deltaTime: number) => void;
export type EngineAfterTickHandler = (engine: Engine) => void;
export type EngineDestroyHandler = (engine: Engine) => void;

export class Engine {
  readonly document: Document;
  readonly registry: ElementRegistry;
  readonly tickHandlers: EngineTickHandler[];
  readonly afterTickHandlers: EngineAfterTickHandler[];
  readonly destroyHandlers: EngineDestroyHandler[];

  constructor(systems: EngineSystem[]) {
    this.document = globalThis.document;
    this.registry = new ElementRegistry();
    this.registry.register(Element);
    this.tickHandlers = [];
    this.afterTickHandlers = [];
    this.destroyHandlers = [];

    // inject custom function document.createGameElement()
    (document as any).createGameElement = (
      snapshot: ElementSnapshot,
    ): Element => {
      const element = this.registry.create(snapshot);
      return element;
    };

    for (const system of systems) {
      system.install(this);
    }
  }

  tick(deltaTime: number): void {
    try {
      for (const handler of this.tickHandlers) {
        handler(this, deltaTime);
      }
    } finally {
      for (const handler of this.afterTickHandlers) {
        handler(this);
      }
    }
  }

  destroy(): void {
    for (let index = this.destroyHandlers.length - 1; index >= 0; index -= 1) {
      this.destroyHandlers[index](this);
    }

    delete (document as any).createGameElement;

    for (const child of Array.from(document.body.children)) {
      if (child instanceof Element) {
        child.remove();
      }
    }
  }
}

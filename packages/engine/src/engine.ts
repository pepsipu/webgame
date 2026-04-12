import { Element } from "./element";
import { ElementRegistry, nativeCreateElement } from "./element-registry";
import type { ElementSnapshot } from "./snapshot";

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

    this.#patchCreateElement();

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

    this.#restoreCreateElement();

    for (const child of Array.from(document.body.children)) {
      if (child instanceof Element) {
        child.remove();
      }
    }
  }

  #patchCreateElement(): void {
    const registry = this.registry;

    (document as any).createElement = function (
      tagOrSnapshot: string | ElementSnapshot,
      options?: ElementCreationOptions,
    ): HTMLElement {
      // if the argument is a snapshot or a registered tag, create from registry
      if (typeof tagOrSnapshot === "object") {
        return registry.create(tagOrSnapshot as ElementSnapshot);
      } else if (registry.hasTag(tagOrSnapshot)) {
        return registry.create({ tag: tagOrSnapshot });
      }

      // otherwise, create a normal DOM element
      return nativeCreateElement.call(document, tagOrSnapshot, options);
    };
  }

  #restoreCreateElement(): void {
    (document as any).createElement = function (
      tag: string,
      options?: ElementCreationOptions,
    ) {
      return nativeCreateElement.call(document, tag, options);
    };
  }
}

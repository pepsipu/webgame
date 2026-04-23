import {
  ElementRegistry,
  createElementHelper,
  setActiveElementRegistry,
} from "./element-registry";

export interface EngineSystem {
  install(engine: Engine): void;
}

export type EngineTickHandler = (engine: Engine, deltaTime: number) => void;
export type EngineAfterTickHandler = (engine: Engine) => void;
export type EngineDestroyHandler = (engine: Engine) => void;

export class Engine {
  readonly registry: ElementRegistry;
  readonly tickHandlers: EngineTickHandler[];
  readonly afterTickHandlers: EngineAfterTickHandler[];
  readonly destroyHandlers: EngineDestroyHandler[];

  constructor(systems: EngineSystem[]) {
    this.registry = new ElementRegistry();
    this.tickHandlers = [];
    this.afterTickHandlers = [];
    this.destroyHandlers = [];

    installElementPrototypeProxy(this.registry);

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

    uninstallElementPrototypeProxy();

    for (const child of Array.from(document.body.children)) {
      if (child.closest("[data-no-replicate]") === null) {
        child.remove();
      }
    }
  }
}

let activeProxyEngineCount = 0;
let originalHTMLElementParent: object | null = null;

function installElementPrototypeProxy(registry: ElementRegistry): void {
  if (activeProxyEngineCount === 0) {
    originalHTMLElementParent = Object.getPrototypeOf(HTMLElement.prototype);

    if (originalHTMLElementParent === null) {
      throw new Error("HTMLElement prototype does not have a parent.");
    }

    const proxyParent = new Proxy(originalHTMLElementParent, {
      get(target, property, receiver) {
        if (typeof property !== "string" || Reflect.has(target, property)) {
          return Reflect.get(target, property, receiver);
        }

        if (!(receiver instanceof HTMLElement)) {
          return Reflect.get(target, property, receiver);
        }

        const helper = createElementHelper(receiver);
        // console.log(`Accessing property "${property}" on <${receiver.tagName}> helper:`, helper);

        if (helper === null || !(property in helper)) {
          return Reflect.get(target, property, receiver);
        }

        const value = Reflect.get(helper, property, helper);

        return typeof value === "function" ? value.bind(helper) : value;
      },
      set(target, property, value, receiver) {
        if (typeof property !== "string" || Reflect.has(target, property)) {
          return Reflect.set(target, property, value, receiver);
        }

        if (!(receiver instanceof HTMLElement)) {
          return Reflect.set(target, property, value, receiver);
        }

        const helper = createElementHelper(receiver);

        if (helper === null || !(property in helper)) {
          return Reflect.set(target, property, value, receiver);
        }

        Reflect.set(helper, property, value, helper);
        return true;
      },
    });

    Object.setPrototypeOf(HTMLElement.prototype, proxyParent);
  }

  activeProxyEngineCount += 1;
  setActiveElementRegistry(registry);
}

function uninstallElementPrototypeProxy(): void {
  if (activeProxyEngineCount === 0) {
    return;
  }

  activeProxyEngineCount -= 1;

  if (activeProxyEngineCount > 0) {
    return;
  }

  if (originalHTMLElementParent !== null) {
    Object.setPrototypeOf(HTMLElement.prototype, originalHTMLElementParent);
  }

  originalHTMLElementParent = null;
  setActiveElementRegistry(null);
}

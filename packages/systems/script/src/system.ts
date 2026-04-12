import {
  type Engine,
  type EngineSystem,
  selectElements,
} from "@webgames/engine";
import { ScriptElement } from "./element";
import { ScriptState } from "./runtime";

export class ScriptSystem implements EngineSystem {
  readonly scripts: Map<ScriptElement, ScriptState> = new Map();

  install(engine: Engine): void {
    engine.registry.register(ScriptElement);
    engine.tickHandlers.push((engine, deltaTime) => {
      this.tick(engine, deltaTime);
    });
    engine.destroyHandlers.push(() => {
      this.destroy();
    });
  }

  private tick(engine: Engine, deltaTime: number): void {
    this.syncScripts(engine);

    for (const state of this.scripts.values()) {
      state.tick(deltaTime);
    }
  }

  private syncScripts(engine: Engine): void {
    const active = new Set(
      selectElements(document, (element): element is ScriptElement => {
        return element instanceof ScriptElement;
      }),
    );

    for (const element of active) {
      const existing = this.scripts.get(element);

      if (existing === undefined) {
        this.scripts.set(element, new ScriptState(element.text));
        continue;
      }

      if (existing.source === element.text) {
        continue;
      }

      existing.destroy();
      this.scripts.set(element, new ScriptState(element.text));
    }

    for (const [element, state] of this.scripts) {
      if (active.has(element)) {
        continue;
      }

      state.destroy();
      this.scripts.delete(element);
    }
  }

  private destroy(): void {
    for (const state of this.scripts.values()) {
      state.destroy();
    }

    this.scripts.clear();
  }
}

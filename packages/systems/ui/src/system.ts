import type { EngineSystem } from "@webgames/engine";
import { UiSystem } from "./dom";
import { ButtonElement } from "./elements/button";
import { ParagraphElement } from "./elements/paragraph";

export const uiSystem: EngineSystem = {
  install(engine) {
    engine.registry.register(ButtonElement, ParagraphElement);
    const ui = new UiSystem();

    engine.afterTickHandlers.push(() => {
      ui.clearFrame();
    });
  },
};

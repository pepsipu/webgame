import type { EngineSystem } from "@webgames/engine";
import { selectElements } from "@webgames/engine";
import { ButtonElement } from "./elements/button";
import { ParagraphElement } from "./elements/paragraph";
import { UiElement } from "./elements";

export const uiSystem: EngineSystem = {
  install(engine) {
    engine.registry.register(ButtonElement, ParagraphElement);

    // after an engine tick, we want to reset their state
    // for example, a button should only be active for one frame after being clicked
    engine.afterTickHandlers.push(() => {
      for (const elem of selectElements(
        document,
        (el): el is UiElement => el instanceof UiElement,
      )) {
        elem.clearFrame();
      }
    });
  },
};

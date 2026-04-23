import type { ElementType, EngineSystem } from "@webgames/engine";
import { selectElements } from "@webgames/engine";
import { ButtonElement } from "./elements/button";
import { ParagraphElement } from "./elements/paragraph";
import { UiElement } from "./elements";

export const uiElements: ElementType[] = [ButtonElement, ParagraphElement];

export const uiSystem: EngineSystem = {
  install(engine) {
    engine.registry.register(ButtonElement, ParagraphElement);

    // after an engine tick, we want to reset their state
    // for example, a button should only be active for one frame after being clicked
    engine.afterTickHandlers.push(() => {
      for (const type of uiElements) {
        for (const element of document.querySelectorAll(
          type.tag,
        ) as NodeListOf<UiElement>) {
          element.clearFrame();
        }
      }
    });
  },
};

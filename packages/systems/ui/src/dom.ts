import { type QueryRoot, selectElements } from "@webgames/engine";
import { UiElement } from "./elements";

export class UiSystem {
  clearFrame(): void {
    const container = (globalThis as any).gameContainer as HTMLElement;

    if (!container) {
      return;
    }

    for (const element of selectElements(
      container,
      (node): node is UiElement => node instanceof UiElement,
    )) {
      element.clearFrame();
    }
  }
}

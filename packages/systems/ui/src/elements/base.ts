import type { ElementField, ElementFields } from "@webgames/engine";
import { Element } from "@webgames/engine";

export abstract class UiElement extends Element {
  static readonly fields: ElementFields<any> = {
    text: {
      get(element: UiElement): string {
        return element.textContent ?? "";
      },
      set(element: UiElement, value: unknown): void {
        if (typeof value !== "string") {
          throw new Error('Field "text" must be a string.');
        }
        element.textContent = value;
      },
    } satisfies ElementField<UiElement>,
  };

  getText(): string {
    return this.textContent ?? "";
  }

  setText(text: string): void {
    this.textContent = text;
  }

  clearFrame(): void {}
}

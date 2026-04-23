import { Element } from "@webgames/engine";

export abstract class UiElement extends Element {
  constructor(element: HTMLElement) {
    super(element);
  }

  getText(): string {
    return this.element.textContent ?? "";
  }

  setText(text: string): void {
    this.element.textContent = text;
  }

  clearFrame(): void {}
}

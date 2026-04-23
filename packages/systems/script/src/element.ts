import { Element } from "@webgames/engine";

export class ScriptElement extends Element {
  static readonly tag: string = "script";

  constructor(element: HTMLElement) {
    super(element);
    if (this.element.textContent === null) {
      this.element.textContent = "";
    }
  }

  get text(): string {
    return this.element.textContent ?? "";
  }

  set text(value: string) {
    this.element.textContent = value;
  }
}

import { UiElement } from "./base";

export class ButtonElement extends UiElement {
  static readonly tag: string = "button";
  #clicked = false;

  constructor(element: HTMLElement) {
    super(element);

    this.element.addEventListener("click", () => {
      this.#clicked = true;
    });
  }

  get clicked(): boolean {
    return this.#clicked;
  }

  set clicked(value: boolean) {
    this.#clicked = value;
  }

  override clearFrame(): void {
    this.clicked = false;
  }

  wasClicked(): boolean {
    return this.#clicked;
  }
}

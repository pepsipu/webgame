import { UiElement } from "./base";

export class ButtonElement extends UiElement {
  static readonly tag: string = "button";

  clicked: boolean = false;

  constructor() {
    super();
    this.addEventListener("click", () => {
      this.clicked = true;
    });
  }

  override clearFrame(): void {
    this.clicked = false;
  }

  wasClicked(): boolean {
    return this.clicked;
  }
}

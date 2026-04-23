import { UiElement } from "./base";

const clickedByElement = new WeakMap<HTMLElement, boolean>();
const listenerInstalled = new WeakSet<HTMLElement>();

export class ButtonElement extends UiElement {
  static readonly tag: string = "button";

  constructor(element: HTMLElement) {
    super(element);

    if (!listenerInstalled.has(this.element)) {
      this.element.addEventListener("click", () => {
        clickedByElement.set(this.element, true);
      });
      listenerInstalled.add(this.element);
    }
  }

  get clicked(): boolean {
    return clickedByElement.get(this.element) ?? false;
  }

  set clicked(value: boolean) {
    clickedByElement.set(this.element, value);
  }

  override clearFrame(): void {
    this.clicked = false;
  }

  wasClicked(): boolean {
    return this.clicked;
  }
}

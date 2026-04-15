import { type QueryRoot, selectElements } from "@webgames/engine";
import { UiElement } from "./elements";

export class UiOverlay {
  readonly root: HTMLDivElement;

  constructor(root: HTMLDivElement) {
    this.root = root;
  }

  render(root: QueryRoot): void {
    const elements = selectElements(
      root,
      (node): node is UiElement => node instanceof UiElement,
    );

    if (
      elements.length !== this.root.children.length ||
      elements.some((el, index) => this.root.children[index] !== el)
    ) {
      this.root.replaceChildren(...elements);
    }
  }

  clearFrame(): void {
    for (const child of Array.from(this.root.children)) {
      if (child instanceof UiElement) {
        child.clearFrame();
      }
    }
  }

  destroy(): void {
    this.root.replaceChildren();
  }
}

import type { UiDomNode } from "../dom-node";
import { UiElement } from "./base";

export class ParagraphElement extends UiElement {
  static readonly tag: string = "p";

  readonly uiType = "p" as const;

  override createDomNode(): UiDomNode {
    const paragraph = document.createElement("p");

    paragraph.dataset.webgamesUi = this.uiType;
    return {
      element: paragraph,
      destroy() {
        paragraph.remove();
      },
    };
  }
}

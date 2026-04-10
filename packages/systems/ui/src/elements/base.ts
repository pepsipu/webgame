import type { ElementFields } from "@webgames/engine";
import { Element, stringField } from "@webgames/engine";
import type { UiDomNode } from "../dom-node";

type UiElementType = "p" | "button";

export abstract class UiElement extends Element {
  static readonly scriptMethods: readonly string[] = ["getText", "setText"];
  static readonly fields: ElementFields<any> = {
    text: stringField<UiElement>("text"),
  } satisfies ElementFields<UiElement>;

  abstract readonly uiType: UiElementType;
  text: string = "";

  getText(): string {
    return this.text;
  }

  setText(text: string): void {
    this.text = text;
  }

  clearFrame(): void {}

  abstract createDomNode(): UiDomNode;
}

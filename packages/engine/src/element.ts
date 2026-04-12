// Base class for all game elements.
// Uses the tag name as the actual DOM element name: <box>, <camera>, etc.
// Prototype-swapped onto the native element so game methods work on real DOM nodes.

import { nativeCreateElement } from "./element-registry";

export class Element {
  static readonly tag: string = "element";

  constructor() {
    const tag = (new.target as typeof Element).tag;
    const el = nativeCreateElement.call(document, tag);
    Object.setPrototypeOf(el, new.target.prototype);
    return el as unknown as Element;
  }

  get classes(): readonly string[] {
    return Array.from(this.classList);
  }

  set classes(value: readonly string[]) {
    this.className = value.join(" ");
  }

  get parent(): Element | null {
    const parent = this.parentElement;
    return parent instanceof Element ? parent : null;
  }
}

Object.setPrototypeOf(Element.prototype, HTMLElement.prototype);

export interface Element extends HTMLElement {}

// Base class for all game elements
// Interally represented via a div with the element's tag as a class

export class Element {
  static readonly tag: string = "element";

  constructor() {
    // prototype chain hacking
    const div = document.createElement("div");
    Object.setPrototypeOf(div, new.target.prototype);

    // read the class's tag, and add it to the div classlist
    const tag = (new.target as typeof Element).tag;
    div.classList.add(tag);

    return div as unknown as Element;
  }

  // for interal registry logic, strip out the tag from the class list
  get classes(): readonly string[] {
    const tag = (this.constructor as typeof Element).tag;
    return Array.from(this.classList).filter((c) => c !== tag);
  }

  set classes(value: readonly string[]) {
    const tag = (this.constructor as typeof Element).tag;
    this.className = [tag, ...value].filter(Boolean).join(" ");
  }

  get parent(): Element | null {
    const parent = this.parentElement;
    return parent instanceof Element ? parent : null;
  }
}

Object.setPrototypeOf(Element.prototype, HTMLDivElement.prototype);

export interface Element extends HTMLDivElement {}

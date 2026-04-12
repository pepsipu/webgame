export class Element {
  static readonly tag: string = "element";
  static readonly scriptProperties: readonly string[] = ["id", "classes"];
  static readonly readonlyScriptProperties: readonly string[] = [
    "parent",
    "children",
    "childElementCount",
    "firstElementChild",
    "lastElementChild",
  ];
  static readonly scriptMethods: readonly string[] = [
    "remove",
    "querySelector",
    "querySelectorAll",
  ];

  constructor() {
    const div = document.createElement("div");
    Object.setPrototypeOf(div, new.target.prototype);

    const tag = (new.target as typeof Element).tag;

    if (tag) {
      div.classList.add(tag);
    }

    return div as unknown as Element;
  }

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

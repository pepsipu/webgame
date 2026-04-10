import { toCustomElementName } from "./element-registry";

export class Element extends HTMLElement {
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

  override querySelector<T extends Element = Element>(
    selector: string,
  ): T | null {
    return super.querySelector(mapSelector(selector)) as T | null;
  }

  override querySelectorAll<T extends Element = Element>(
    selector: string,
  ): NodeListOf<T> {
    return super.querySelectorAll(
      mapSelector(selector),
    ) as NodeListOf<T>;
  }
}

function mapSelector(selector: string): string {
  return selector.replace(
    /(?<=^|[\s>+~,])([a-z][a-z0-9]*)(?=[\s>+~,.#\[:)]|$)/g,
    (match) => toCustomElementName(match),
  );
}

import { resolveElementTypeForElement, ElementType } from "./element-registry";

// Registerable helper class for elements.
// When a subclass is registered with a `static readonly tag: string`,
// The fields and methods of the class become available on any HTMLElement with the matching tag name.
// At runtime, the HTMLElement is wrapped in a Proxy that forwards property accesses,
// creating a cached instance of the class on demand.
// Attributes on the underlying HTMLElement will be replicated, but properties of this helper are not replicated.
export class Element {
  readonly element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  get classes(): readonly string[] {
    return Array.from(this.element.classList);
  }

  set classes(value: readonly string[]) {
    this.element.className = value.join(" ");
  }

  get id(): string {
    return this.element.id;
  }

  set id(value: string) {
    this.element.id = value;
  }

  get parent(): Element | null {
    const parent = this.element.parentElement;

    if (parent !== null && parent instanceof Element) {
      return parent;
    }

    return null;
  }

  getAttribute(name: string): string | null {
    return this.element.getAttribute(name);
  }

  setAttribute(name: string, value: string): void {
    this.element.setAttribute(name, value);
  }

  hasAttribute(name: string): boolean {
    return this.element.hasAttribute(name);
  }

  removeAttribute(name: string): void {
    this.element.removeAttribute(name);
  }

  protected ensureAttribute(name: string, value: string): void {
    if (!this.element.hasAttribute(name)) {
      this.element.setAttribute(name, value);
    }
  }

  protected getNumberAttribute(name: string, fallback: number): number {
    const value = this.element.getAttribute(name);

    if (value === null) {
      return fallback;
    }

    const parsed = parseFloat(value);

    if (Number.isNaN(parsed)) {
      return fallback;
    }

    return parsed;
  }

  protected setNumberAttribute(name: string, value: number): void {
    this.element.setAttribute(name, String(value));
  }

  protected getStringAttribute(name: string, fallback = ""): string {
    return this.element.getAttribute(name) ?? fallback;
  }

  protected setStringAttribute(name: string, value: string): void {
    this.element.setAttribute(name, value);
  }

  isElementType(type: ElementType): boolean {
    // we can no longer use instanceof on an ElementType, so we check the tag name instead
    return this.element.tagName.toLowerCase() === type.tag;
  }

  static [Symbol.hasInstance](value: unknown): boolean {
    if (!(value instanceof HTMLElement)) {
      return false;
    }

    const type = resolveElementTypeForElement(value);

    if (type === undefined) {
      return false;
    }

    const expectedType = this as unknown as { prototype: object };

    return expectedType.prototype.isPrototypeOf(type.prototype);
  }
}

export interface Element extends HTMLElement {}

import type { ElementSnapshot } from "./snapshot";

export const nativeCreateElement = Document.prototype.createElement;

export type ElementType<T extends object = object> = (new (
  element: HTMLElement,
) => T) & {
  readonly tag: string;
  readonly replicated?: boolean;
};

let activeElementRegistry: ElementRegistry | null = null;

export function setActiveElementRegistry(
  registry: ElementRegistry | null,
): void {
  activeElementRegistry = registry;
}

export function resolveElementTypeForElement(
  element: HTMLElement,
): ElementType | undefined {
  return activeElementRegistry?.getTypeForElement(element);
}

export function createElementHelper(
  element: HTMLElement,
): object | null {
  return activeElementRegistry?.createHelper(element) ?? null;
}

export class ElementRegistry {
  readonly #typesByTag = new Map<string, ElementType>();

  register(...types: ElementType[]): void {
    for (const type of types) {
      const tag = getOwnTag(type);

      if (tag === undefined) {
        throw new Error(`Element class "${type.name}" is missing a tag.`);
      }

      const existing = this.#typesByTag.get(tag);

      if (existing !== undefined) {
        throw new Error(`Element tag "${tag}" is already registered.`);
      }

      this.#typesByTag.set(tag, type);
    }
  }

  hasTag(tag: string): boolean {
    return this.#typesByTag.has(tag);
  }

  getTypeForElement(element: HTMLElement): ElementType | undefined {
    return this.#typesByTag.get(element.tagName.toLowerCase());
  }

  createHelper(element: HTMLElement): object | null {
    const type = this.getTypeForElement(element);

    if (type === undefined) {
      return null;
    }

    return new type(element);
  }

  create(snapshot: ElementSnapshot): HTMLElement {
    const element = nativeCreateElement.call(document, snapshot.tag);

    this.#syncElement(element, snapshot);
    return element;
  }

  getSnapshot(element: HTMLElement): ElementSnapshot {
    const snapshot: ElementSnapshot = {
      tag: element.tagName,
      attributes: getAttributesSnapshot(element),
      text: getTextSnapshot(element),
      children: Array.from(element.children)
        .filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && this.#isReplicated(child),
        )
        .map((child) => this.getSnapshot(child)),
    };

    return snapshot;
  }

  applySnapshot(element: HTMLElement, snapshot: ElementSnapshot): void {
    if (element.tagName !== snapshot.tag) {
      throw new Error(
        `Cannot apply <${snapshot.tag}> snapshot to <${element.tagName}>.`,
      );
    }

    this.#syncElement(element, snapshot);
  }

  getGameSnapshot(): ElementSnapshot {
    return {
      tag: "game",
      children: Array.from(document.body.children)
        .filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && this.#isReplicated(child),
        )
        .map((child) => this.getSnapshot(child)),
    };
  }

  loadGameSnapshot(snapshot: ElementSnapshot): void {
    this.#syncChildren(document.body, snapshot.children ?? []);
  }

  #syncChildren(parent: HTMLElement, snapshots: ElementSnapshot[]): void {
    const children = Array.from(parent.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && this.#isReplicated(child),
    );

    for (let index = 0; index < snapshots.length; index += 1) {
      const snapshot = snapshots[index];
      const child = children[index];

      if (child === undefined) {
        parent.append(this.create(snapshot));
        continue;
      }

      if (child.tagName !== snapshot.tag) {
        const replacement = this.create(snapshot);

        child.before(replacement);
        child.remove();
        continue;
      }

      this.#syncElement(child, snapshot);
    }

    for (let index = snapshots.length; index < children.length; index += 1) {
      children[index].remove();
    }
  }

  #syncElement(
    element: HTMLElement,
    snapshot: ElementSnapshot,
  ): void {
    setAttributesFromSnapshot(element, snapshot.attributes);
    setTextFromSnapshot(element, snapshot.text);

    this.#syncChildren(element, snapshot.children ?? []);
  }

  #isReplicated(element: HTMLElement): boolean {
    if (element.closest("[data-no-replicate]") !== null) {
      return false;
    }

    const type = this.getTypeForElement(element);

    if (type === undefined) {
      return true;
    }

    return type.replicated !== false;
  }

  requireType(tag: string): ElementType {
    const type = this.#typesByTag.get(tag);

    if (type === undefined) {
      throw new Error(`Element tag "${tag}" is not registered.`);
    }

    return type;
  }
}

function getOwnTag(type: ElementType): string | undefined {
  return Object.hasOwn(type, "tag") ? type.tag : undefined;
}

function getAttributesSnapshot(element: HTMLElement): Record<string, string> {
  const attributes: Record<string, string> = {};

  for (const attribute of Array.from(element.attributes)) {
    attributes[attribute.name] = attribute.value;
  }

  return attributes;
}

function getTextSnapshot(element: HTMLElement): string | undefined {
  let text = "";

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.nodeValue ?? "";
    }
  }

  return text === "" ? undefined : text;
}

function setAttributesFromSnapshot(
  element: HTMLElement,
  attributes: Record<string, string> | undefined,
): void {
  const nextEntries = Object.entries(attributes ?? {});
  const nextNames = new Set(nextEntries.map(([name]) => name));

  for (const attribute of Array.from(element.attributes)) {
    if (!nextNames.has(attribute.name)) {
      element.removeAttribute(attribute.name);
    }
  }

  for (const [name, value] of nextEntries) {
    element.setAttribute(name, value);
  }
}

function setTextFromSnapshot(
  element: HTMLElement,
  text: string | undefined,
): void {
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.remove();
    }
  }

  if (text === undefined) {
    return;
  }

  element.prepend(document.createTextNode(text));
}

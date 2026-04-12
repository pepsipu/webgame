import { Element } from "./element";
import type { ElementSnapshot } from "./snapshot";

export interface ElementField<T extends Element = Element> {
  get?(element: T): unknown;
  set(element: T, value: unknown): void;
}

export type ElementFields<T extends Element = Element> = Readonly<
  Record<string, ElementField<T>>
>;

export type ElementType<T extends Element = Element> = (new (
  ...args: any[]
) => T) & {
  readonly tag?: string;
  readonly fields?: ElementFields<any>;
  readonly replicated?: boolean;
};

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

  create(snapshot: ElementSnapshot): Element {
    const type = this.requireType(snapshot.tag);
    const element = new (type as unknown as new () => Element)();

    this.#syncElement(element, type, snapshot);
    return element;
  }

  getSnapshot(element: Element): ElementSnapshot {
    const type = getElementType(element);
    const tag = this.#requireTag(type);
    const snapshot: ElementSnapshot = {
      tag,
      id: element.id || null,
      class: [...element.classes],
      children: Array.from(element.children)
        .filter(
          (child): child is Element =>
            child instanceof Element && this.#isReplicated(child),
        )
        .map((child) => this.getSnapshot(child)),
    };

    this.#forEachField(type, (key, field) => {
      snapshot[key] =
        field.get?.(element as never) ?? Reflect.get(element, key, element);
    });

    return snapshot;
  }

  applySnapshot(element: Element, snapshot: ElementSnapshot): void {
    const type = getElementType(element);

    if (this.#requireTag(type) !== snapshot.tag) {
      throw new Error(
        `Cannot apply <${snapshot.tag}> snapshot to ${element.constructor.name}.`,
      );
    }

    this.#syncElement(element, type, snapshot);
  }

  getGameSnapshot(): ElementSnapshot {
    return {
      tag: "game",
      children: Array.from(document.body.children)
        .filter(
          (child): child is Element =>
            child instanceof Element && this.#isReplicated(child),
        )
        .map((child) => this.getSnapshot(child)),
    };
  }

  loadGameSnapshot(snapshot: ElementSnapshot): void {
    this.#syncChildren(document.body, snapshot.children ?? []);
  }

  #syncChildren(
    parent: Element | HTMLElement,
    snapshots: ElementSnapshot[],
  ): void {
    const children = Array.from(parent.children).filter(
      (child): child is Element =>
        child instanceof Element && this.#isReplicated(child),
    );

    for (let index = 0; index < snapshots.length; index += 1) {
      const snapshot = snapshots[index];
      const child = children[index];

      if (child === undefined) {
        parent.append(this.create(snapshot));
        continue;
      }

      const childType = getElementType(child);

      if (this.#requireTag(childType) !== snapshot.tag) {
        const replacement = this.create(snapshot);

        child.before(replacement);
        child.remove();
        continue;
      }

      this.#syncElement(child, childType, snapshot);
    }

    for (let index = snapshots.length; index < children.length; index += 1) {
      children[index].remove();
    }
  }

  #syncElement(
    element: Element,
    type: ElementType,
    snapshot: ElementSnapshot,
  ): void {
    element.id = snapshot.id ?? "";
    element.classes = snapshot.class ?? [];

    this.#forEachField(type, (key, field) => {
      if (key in snapshot) {
        field.set(element as never, snapshot[key] as never);
      }
    });

    this.#syncChildren(element, snapshot.children ?? []);
  }

  #isReplicated(element: Element): boolean {
    const type = getElementType(element);

    this.#requireTag(type);
    return type.replicated !== false;
  }

  #forEachField(
    type: ElementType,
    callback: (key: string, field: ElementField) => void,
  ): void {
    for (const current of getElementTypeChain(type)) {
      if (!Object.hasOwn(current, "fields")) {
        continue;
      }

      for (const [key, field] of Object.entries(current.fields ?? {})) {
        callback(key, field);
      }
    }
  }

  #requireTag(type: ElementType): string {
    const tag = getOwnTag(type);

    if (tag !== undefined && this.#typesByTag.get(tag) === type) {
      return tag;
    }

    throw new Error(`Element class "${type.name}" is not registered.`);
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

function getElementType(value: object): ElementType {
  return (Object.getPrototypeOf(value) as { constructor: ElementType })
    .constructor;
}

function getElementTypeChain(type: ElementType): ElementType[] {
  const types: ElementType[] = [];

  for (
    let current: object | null = type;
    current !== null && current !== Function.prototype;
    current = Object.getPrototypeOf(current)
  ) {
    types.unshift(current as ElementType);
  }

  return types;
}

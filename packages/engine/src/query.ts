import { Element } from "./element";

type ElementQuery<T extends Element = Element> =
  | ((element: Element) => element is T)
  | ((element: Element) => boolean);

export function selectElements<T extends Element = Element>(
  root: Element,
  query: ElementQuery<T>,
): T[] {
  const results: T[] = [];
  walkTree(root, (element) => {
    if (query(element)) {
      results.push(element as T);
    }
  });
  return results;
}

export function selectElement<T extends Element = Element>(
  root: Element,
  query: ElementQuery<T>,
): T | null {
  for (const child of Array.from(root.children)) {
    if (child instanceof Element) {
      if (query(child)) {
        return child as T;
      }

      const found = selectElement(child, query);

      if (found !== null) {
        return found;
      }
    }
  }

  return null;
}

function walkTree(root: Element, callback: (element: Element) => void): void {
  for (const child of Array.from(root.children)) {
    if (child instanceof Element) {
      callback(child);
      walkTree(child, callback);
    }
  }
}

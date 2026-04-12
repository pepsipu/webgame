import { Element } from "./element";

export type QueryRoot = { readonly children: HTMLCollection };

type ElementQuery<T extends Element = Element> =
  | ((element: Element) => element is T)
  | ((element: Element) => boolean);

export function selectElements<T extends Element = Element>(
  root: QueryRoot,
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
  root: QueryRoot,
  query: ElementQuery<T>,
): T | null {
  for (const child of Array.from(root.children)) {
    if (child instanceof Element) {
      if (query(child)) {
        return child as T;
      }

      const found = selectElement<T>(child, query);

      if (found !== null) {
        return found;
      }
    } else if (child.children.length > 0) {
      const found = selectElement<T>(child, query);

      if (found !== null) {
        return found;
      }
    }
  }

  return null;
}

function walkTree(root: QueryRoot, callback: (element: Element) => void): void {
  for (const child of Array.from(root.children)) {
    if (child instanceof Element) {
      callback(child);
      walkTree(child, callback);
    } else if (child.children.length > 0) {
      walkTree(child, callback);
    }
  }
}

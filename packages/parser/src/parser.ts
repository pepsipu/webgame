import type { ElementSnapshot, Engine } from "@webgames/engine";
import type { UnparsedXmlNode } from "./parse-base";
import {
  getAttributes,
  getChildren,
  getText,
  getType,
  parseXmlText,
} from "./parse-base";

// loads the game file onto an engine instance.
export function loadGameFile(engine: Engine, text: string): void {
  engine.registry.loadGameSnapshot(parseGameFile(text));
}

export function parseGameFile(text: string): ElementSnapshot {
  const gameNode = parseXmlText(text);
  if (getType(gameNode) !== "game") {
    throw new Error(
      `Invalid XML: root node must be <game>. Found <${getType(gameNode)}> instead.`,
    );
  }

  return createSnapshot(gameNode);
}

function createSnapshot(element: UnparsedXmlNode): ElementSnapshot {
  const attributes = getAttributes(element);
  const snapshot: ElementSnapshot = {
    tag: getType(element),
    attributes,
    children: getChildren(element).map(createSnapshot),
  };

  const text = getText(element);

  if (text !== undefined) {
    snapshot.text = text;
  }

  return snapshot;
}

import type { ElementRegistry } from "./element-registry";
import { Element } from "./element";
import type { ElementSnapshot } from "./snapshot";

export class Document extends Element {
  static readonly tag: string = "game";
  static readonly scriptMethods: readonly string[] = ["createElement"];

  registry!: ElementRegistry;

  createElement(snapshot: ElementSnapshot): void {
    this.append(this.registry.create(snapshot));
  }
}

import { createBoxMesh, type Mesh } from "./mesh";
import { ShapeElement } from "./shape";

export class BoxElement extends ShapeElement {
  static readonly tag: string = "box";

  constructor(element: HTMLElement) {
    super(element);
    this.ensureAttribute("width", "1");
    this.ensureAttribute("height", "1");
    this.ensureAttribute("depth", "1");
  }

  get width(): number {
    return this.getNumberAttribute("width", 1);
  }

  set width(value: number) {
    this.setNumberAttribute("width", value);
  }

  get height(): number {
    return this.getNumberAttribute("height", 1);
  }

  set height(value: number) {
    this.setNumberAttribute("height", value);
  }

  get depth(): number {
    return this.getNumberAttribute("depth", 1);
  }

  set depth(value: number) {
    this.setNumberAttribute("depth", value);
  }

  protected createMesh(): Mesh {
    return createBoxMesh(this.width, this.height, this.depth);
  }

  protected getMeshKey(): string {
    return `${this.width}:${this.height}:${this.depth}`;
  }
}

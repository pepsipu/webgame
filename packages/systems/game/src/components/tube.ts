import { createTubeMesh, type Mesh } from "./mesh";
import { ShapeElement } from "./shape";

export class TubeElement extends ShapeElement {
  static readonly tag: string = "tube";

  constructor(element: HTMLElement) {
    super(element);
    this.ensureAttribute("radius", "0.5");
    this.ensureAttribute("height", "1");
    this.ensureAttribute("segments", "24");
  }

  get radius(): number {
    return this.getNumberAttribute("radius", 0.5);
  }

  set radius(value: number) {
    this.setNumberAttribute("radius", value);
  }

  get height(): number {
    return this.getNumberAttribute("height", 1);
  }

  set height(value: number) {
    this.setNumberAttribute("height", value);
  }

  get segments(): number {
    return this.getNumberAttribute("segments", 24);
  }

  set segments(value: number) {
    this.setNumberAttribute("segments", value);
  }

  protected createMesh(): Mesh {
    return createTubeMesh(this.radius, this.height, this.segments);
  }

  protected getMeshKey(): string {
    return `${this.radius}:${this.height}:${this.segments}`;
  }
}

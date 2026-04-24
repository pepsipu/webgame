import { createBallMesh, type Mesh } from "./mesh";
import { ShapeElement } from "./shape";

export class BallElement extends ShapeElement {
  static readonly tag: string = "ball";

  constructor(element: HTMLElement) {
    super(element);
    this.ensureAttribute("radius", "0.5");
    this.ensureAttribute("segments", "20");
    this.ensureAttribute("rings", "14");
  }

  get radius(): number {
    return this.getNumberAttribute("radius", 0.5);
  }

  set radius(value: number) {
    this.setNumberAttribute("radius", value);
  }

  get segments(): number {
    return this.getNumberAttribute("segments", 20);
  }

  set segments(value: number) {
    this.setNumberAttribute("segments", value);
  }

  get rings(): number {
    return this.getNumberAttribute("rings", 14);
  }

  set rings(value: number) {
    this.setNumberAttribute("rings", value);
  }

  protected createMesh(): Mesh {
    return createBallMesh(this.radius, this.segments, this.rings);
  }

  protected getMeshKey(): string {
    return `${this.radius}:${this.segments}:${this.rings}`;
  }
}

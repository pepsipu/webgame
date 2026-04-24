import { TransformElement } from "./transform";

export class CameraElement extends TransformElement {
  static readonly tag: string = "camera";

  constructor(element: HTMLElement) {
    super(element);
    this.ensureAttribute("fovY", `${Math.PI / 3}`);
    this.ensureAttribute("near", "0.1");
    this.ensureAttribute("far", "100");
  }

  get fovY(): number {
    return this.getNumberAttribute("fovY", Math.PI / 3);
  }

  set fovY(value: number) {
    this.setNumberAttribute("fovY", value);
  }

  get near(): number {
    return this.getNumberAttribute("near", 0.1);
  }

  set near(value: number) {
    this.setNumberAttribute("near", value);
  }

  get far(): number {
    return this.getNumberAttribute("far", 100);
  }

  set far(value: number) {
    this.setNumberAttribute("far", value);
  }
}

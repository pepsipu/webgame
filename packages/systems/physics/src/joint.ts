import { Element } from "@webgames/engine";
import {
  parseVector3Attribute,
  type Vector3 as Vector3Value,
  Vector3,
} from "@webgames/game";

export class SphericalJointElement extends Element {
  static readonly tag: string = "spherical-joint";
  static readonly replicated: boolean = false;

  constructor(element: HTMLElement) {
    super(element);
    this.ensureAttribute("body1", "");
    this.ensureAttribute("body2", "");
    this.ensureAttribute("anchor1", "0 0 0");
    this.ensureAttribute("anchor2", "0 0 0");
  }

  get body1(): string {
    return this.getStringAttribute("body1", "");
  }

  set body1(value: string) {
    this.setStringAttribute("body1", value);
  }

  get body2(): string {
    return this.getStringAttribute("body2", "");
  }

  set body2(value: string) {
    this.setStringAttribute("body2", value);
  }

  get anchor1(): Vector3Value {
    const [x, y, z] = parseVector3Attribute(this.element, "anchor1", [0, 0, 0]);

    return Vector3.create(x, y, z);
  }

  set anchor1(value: Vector3Value) {
    this.setAttribute("anchor1", `${value[0]} ${value[1]} ${value[2]}`);
  }

  get anchor2(): Vector3Value {
    const [x, y, z] = parseVector3Attribute(this.element, "anchor2", [0, 0, 0]);

    return Vector3.create(x, y, z);
  }

  set anchor2(value: Vector3Value) {
    this.setAttribute("anchor2", `${value[0]} ${value[1]} ${value[2]}`);
  }
}

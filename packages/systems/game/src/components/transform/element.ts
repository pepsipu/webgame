import { Element } from "@webgames/engine";
import { Quaternion } from "../../math/quaternion";
import { Vector3 } from "../../math/vector3";
import { Transform } from "./value";

export class TransformElement extends Element {
  static readonly tag: string = "transform";

  constructor(element: HTMLElement) {
    super(element);
    this.ensureAttribute("position", "0 0 0");
    this.ensureAttribute("rotation", "0 0 0");
    this.ensureAttribute("scale", "1 1 1");
  }

  get position(): Vector3 {
    return Vector3.create(...parseVector3String(this.getAttribute("position") ?? "0 0 0", "position"));
  }

  set position(value: readonly number[]) {
    if (
      value.length !== 3 ||
      value.some((entry) => typeof entry !== "number" || Number.isNaN(entry))
    ) {
      throw new Error('Property "position" must be a 3D vector.');
    }

    this.setAttribute("position", `${value[0]} ${value[1]} ${value[2]}`);
  }

  get rotation(): Quaternion {
    const value = this.getAttribute("rotation") ?? "0 0 0";
    const parsed = value
      .trim()
      .split(/\s+/)
      .map((entry) => parseFloat(entry));

    if (parsed.length === 4 && parsed.every((entry) => !Number.isNaN(entry))) {
      return Quaternion.create(parsed[0], parsed[1], parsed[2], parsed[3]);
    }

    if (parsed.length === 3 && parsed.every((entry) => !Number.isNaN(entry))) {
      const transform = Transform.create();

      Transform.setRotationFromEuler(transform, parsed[0], parsed[1], parsed[2]);
      return Quaternion.clone(transform.rotation);
    }

    return Quaternion.create();
  }

  set rotation(value: readonly number[]) {
    if (
      value.length !== 4 ||
      value.some((entry) => typeof entry !== "number" || Number.isNaN(entry))
    ) {
      throw new Error('Property "rotation" must be a quaternion.');
    }

    this.setAttribute("rotation", `${value[0]} ${value[1]} ${value[2]} ${value[3]}`);
  }

  get scale(): Vector3 {
    return Vector3.create(...parseVector3String(this.getAttribute("scale") ?? "1 1 1", "scale"));
  }

  set scale(value: readonly number[]) {
    if (
      value.length !== 3 ||
      value.some((entry) => typeof entry !== "number" || Number.isNaN(entry))
    ) {
      throw new Error('Property "scale" must be a 3D vector.');
    }

    this.setAttribute("scale", `${value[0]} ${value[1]} ${value[2]}`);
  }

  get transform(): Transform {
    return Transform.create(this.position, this.rotation, this.scale);
  }

  setPosition(x: number, y: number, z: number): void {
    this.setAttribute("position", `${x} ${y} ${z}`);
  }

  setRotation(x: number, y: number, z: number, w: number): void {
    this.setAttribute("rotation", `${x} ${y} ${z} ${w}`);
  }

  setRotationFromEuler(x: number, y: number, z: number): void {
    this.setAttribute("rotation", `${x} ${y} ${z}`);
  }

  setScale(x: number, y: number, z: number): void {
    this.setAttribute("scale", `${x} ${y} ${z}`);
  }
}

function parseVector3String(
  value: string,
  key: string,
): [number, number, number] {
  const parts = value
    .trim()
    .split(/\s+/)
    .map((entry) => parseFloat(entry));

  if (parts.length !== 3 || parts.some((entry) => Number.isNaN(entry))) {
    throw new Error(`Field "${key}" must be three numbers.`);
  }

  return [parts[0], parts[1], parts[2]];
}

export function parseVector3Attribute(
  element: HTMLElement,
  key: string,
  fallback: [number, number, number],
): [number, number, number] {
  const value = element.getAttribute(key);

  if (value === null) {
    return fallback;
  }

  return parseVector3String(value, key);
}

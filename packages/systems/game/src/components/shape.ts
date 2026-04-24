import type { Mesh } from "./mesh";
import type { Material } from "./material";
import { TransformElement, parseVector3Attribute } from "./transform";
import { Vector3 } from "../math/vector3";

export abstract class ShapeElement extends TransformElement {
  #mesh: Mesh | null;
  #meshKey: string | null;

  constructor(element: HTMLElement) {
    super(element);
    this.ensureAttribute("color", "1 1 1");
    this.#mesh = null;
    this.#meshKey = null;
  }

  get material(): Material {
    return Vector3.create(
      ...parseVector3Attribute(this.element, "color", [1, 1, 1]),
    );
  }

  set material(value: Material) {
    this.setAttribute("color", `${value[0]} ${value[1]} ${value[2]}`);
  }

  get mesh(): Mesh {
    const meshKey = this.getMeshKey();

    if (this.#mesh !== null && this.#meshKey === meshKey) {
      return this.#mesh;
    }

    const mesh = this.createMesh();

    this.#mesh = mesh;
    this.#meshKey = meshKey;
    return mesh;
  }

  setColor(r: number, g: number, b: number): void {
    // this.material[0] = r;
    // this.material[1] = g;
    // this.material[2] = b;
    this.material = [r, g, b];
    // todo: unfortunate solution because writes to this.material array
    // does not update the dom element's state
  }

  protected abstract createMesh(): Mesh;

  protected abstract getMeshKey(): string;
}

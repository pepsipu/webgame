import type { Mesh } from "./mesh";
import type { Material } from "./material";
import { TransformElement, parseVector3Attribute } from "./transform";
import { Vector3 } from "../math/vector3";

type MeshCacheEntry = {
  mesh: Mesh;
  key: string;
};

const meshCache = new WeakMap<HTMLElement, MeshCacheEntry>();

export abstract class ShapeElement extends TransformElement {
  constructor(element: HTMLElement) {
    super(element);
    this.ensureAttribute("color", "1 1 1");
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
    const key = this.getMeshKey();
    const cached = meshCache.get(this.element);

    if (cached !== undefined && cached.key === key) {
      return cached.mesh;
    }

    const mesh = this.createMesh();

    meshCache.set(this.element, { mesh, key });
    return mesh;
  }

  setColor(r: number, g: number, b: number): void {
    this.material[0] = r;
    this.material[1] = g;
    this.material[2] = b;
  }

  protected abstract createMesh(): Mesh;

  protected abstract getMeshKey(): string;
}

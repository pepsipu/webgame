import type { ElementFields } from "@webgames/engine";
import type { Mesh } from "./mesh";
import type { Material } from "./material";
import { TransformElement, vector3Field } from "./transform";
import { Vector3 } from "../math/vector3";

export abstract class ShapeElement extends TransformElement {
  static readonly fields: ElementFields<any> = {
    color: vector3Field<ShapeElement>("color", (element) => element.material),
  } satisfies ElementFields<ShapeElement>;

  material: Material;
  private cachedMesh: Mesh | null;
  private cachedMeshKey: string | null;

  constructor() {
    super();
    this.material = Vector3.create(1, 1, 1);
    this.cachedMesh = null;
    this.cachedMeshKey = null;
  }

  get mesh(): Mesh {
    const meshKey = this.getMeshKey();

    if (this.cachedMesh !== null && this.cachedMeshKey === meshKey) {
      return this.cachedMesh;
    }

    const mesh = this.createMesh();

    this.cachedMesh = mesh;
    this.cachedMeshKey = meshKey;
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

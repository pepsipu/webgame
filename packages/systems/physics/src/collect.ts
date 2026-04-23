import { type QueryRoot, selectElements } from "@webgames/engine";
import { ShapeElement, shapeElements } from "@webgames/game";
import { SphericalJointElement } from "./joint";
import { getShapePhysicsBody } from "./shape";

export interface PhysicsScene {
  bodies: Set<ShapeElement>;
  bodiesById: Map<string, ShapeElement>;
  joints: Set<SphericalJointElement>;
}

export function collectPhysicsScene(root: QueryRoot): PhysicsScene {
  const bodies = new Set<ShapeElement>();
  for (const type of shapeElements) {
    for (const element of Array.from(
      document.querySelectorAll(type.tag) as NodeListOf<ShapeElement>,
    )) {
      if (getShapePhysicsBody(element) === "none") {
        continue;
      }
      bodies.add(element);
    }
  }
  const bodiesById = new Map<string, ShapeElement>();

  for (const element of bodies) {
    const id = element.id;

    if (id === "") {
      continue;
    }

    if (bodiesById.has(id)) {
      throw new Error(`Duplicate physics body id "${id}".`);
    }

    bodiesById.set(id, element);
  }

  const scene: PhysicsScene = {
    bodies,
    bodiesById,
    joints: new Set(
      Array.from(
        document.querySelectorAll(
          SphericalJointElement.tag,
        ) as NodeListOf<SphericalJointElement>,
      ),
    ),
  };

  return scene;
}

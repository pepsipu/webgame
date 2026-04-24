import { ShapeElement, Transform, Vector3 } from "@webgames/game";
import type { RigidBody } from "./rapier";

export type PhysicsBodyType = "none" | "fixed" | "dynamic";

type ShapeElementType = typeof ShapeElement & {
  prototype: ShapeElement;
};

type ShapePhysicsPrototype = ShapeElement & {
  body: PhysicsBodyType;
  applyForce(x: number, y: number, z: number): void;
  applyForceAtPoint(
    forceX: number,
    forceY: number,
    forceZ: number,
    pointX: number,
    pointY: number,
    pointZ: number,
  ): void;
  applyImpulse(x: number, y: number, z: number): void;
  applyImpulseAtPoint(
    impulseX: number,
    impulseY: number,
    impulseZ: number,
    pointX: number,
    pointY: number,
    pointZ: number,
  ): void;
};

const rigidBodyKey = Symbol("shape-rigid-body");
const scratchTransform = Transform.create();
const scratchPoint = Vector3.create();

let installed = false;

// TODO: we should probably extend existing elements in a simpler way
export function installShapePhysics(): void {
  if (installed) {
    return;
  }

  installed = true;

  const type = ShapeElement as ShapeElementType;

  Object.defineProperty(type.prototype, "body", {
    configurable: true,
    get(this: ShapeElement): PhysicsBodyType {
      return getShapePhysicsBody(this);
    },
    set(this: ShapeElement, value: PhysicsBodyType) {
      getElementNode(this).setAttribute("body", requireBodyType(value));
    },
  });
  Object.assign(type.prototype as ShapePhysicsPrototype, {
    applyForce(this: ShapeElement, x: number, y: number, z: number): void {
      requireRigidBody(this).addForce({ x, y, z }, true);
    },
    applyForceAtPoint(
      this: ShapeElement,
      forceX: number,
      forceY: number,
      forceZ: number,
      pointX: number,
      pointY: number,
      pointZ: number,
    ): void {
      const point = transformPoint(this, pointX, pointY, pointZ);

      requireRigidBody(this).addForceAtPoint(
        { x: forceX, y: forceY, z: forceZ },
        { x: point[0], y: point[1], z: point[2] },
        true,
      );
    },
    applyImpulse(this: ShapeElement, x: number, y: number, z: number): void {
      requireRigidBody(this).applyImpulse({ x, y, z }, true);
    },
    applyImpulseAtPoint(
      this: ShapeElement,
      impulseX: number,
      impulseY: number,
      impulseZ: number,
      pointX: number,
      pointY: number,
      pointZ: number,
    ): void {
      const point = transformPoint(this, pointX, pointY, pointZ);

      requireRigidBody(this).applyImpulseAtPoint(
        { x: impulseX, y: impulseY, z: impulseZ },
        { x: point[0], y: point[1], z: point[2] },
        true,
      );
    },
  });
}

export function getShapePhysicsBody(element: ShapeElement): PhysicsBodyType {
  const value = getElementNode(element).getAttribute("body");

  if (value === null || value === "") {
    return "none";
  }

  return requireBodyType(value);
}

export function setShapeRigidBody(
  element: ShapeElement,
  body: RigidBody,
): void {
  getShapeElementWithRigidBody(element)[rigidBodyKey] = body;
}

export function clearShapeRigidBody(element: ShapeElement): void {
  delete getShapeElementWithRigidBody(element)[rigidBodyKey];
}

function requireRigidBody(element: ShapeElement): RigidBody {
  const body = getShapeElementWithRigidBody(element)[rigidBodyKey];

  if (body !== undefined) {
    return body;
  }

  throw new Error("Shape does not have a physics body.");
}

function transformPoint(
  element: ShapeElement,
  x: number,
  y: number,
  z: number,
): Vector3 {
  Transform.getWorld(scratchTransform, element);
  Vector3.set(scratchPoint, x, y, z);
  Transform.transformPoint(scratchPoint, scratchTransform, scratchPoint);
  return scratchPoint;
}

function requireBodyType(value: unknown): PhysicsBodyType {
  switch (value) {
    case "none":
    case "fixed":
    case "dynamic":
      return value;
    default:
      throw new Error('Field "body" must be "none", "fixed", or "dynamic".');
  }
}

function getElementNode(element: ShapeElement): HTMLElement {
  const helperElement = (element as unknown as { element?: HTMLElement })
    .element;

  return helperElement instanceof HTMLElement
    ? helperElement
    : (element as unknown as HTMLElement);
}

type ShapeElementWithRigidBody = HTMLElement & {
  [rigidBodyKey]?: RigidBody;
};

function getShapeElementWithRigidBody(
  element: ShapeElement,
): ShapeElementWithRigidBody {
  return getElementNode(element) as ShapeElementWithRigidBody;
}

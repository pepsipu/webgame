import type { ElementType, EngineSystem } from "@webgames/engine";
import { BallElement } from "./components/ball";
import { BoxElement } from "./components/box";
import { CameraElement } from "./components/camera";
import { TransformElement } from "./components/transform";
import { TubeElement } from "./components/tube";

export const shapeElements: ElementType[] = [
  BoxElement,
  TubeElement,
  BallElement,
];

export const gameSystem: EngineSystem = {
  install(engine) {
    engine.registry.register(
      TransformElement,
      CameraElement,
      BoxElement,
      TubeElement,
      BallElement,
    );
  },
};

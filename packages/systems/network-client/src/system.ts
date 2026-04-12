import type { EngineSystem } from "@webgames/engine";
import { ClientNetworkServiceElement } from "./client";

export const clientNetworkSystem: EngineSystem = {
  install(engine) {
    engine.registry.register(ClientNetworkServiceElement);
    const networkService = new ClientNetworkServiceElement();
    document.body.append(networkService);

    engine.tickHandlers.push(() => {
      networkService.applyPendingSnapshot(engine.registry);
    });
    engine.destroyHandlers.push(() => {
      networkService.destroy();
    });
  },
};

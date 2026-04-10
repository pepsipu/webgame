import type { EngineSystem } from "@webgames/engine";
import { ServerNetworkServiceElement } from "./server";

export const serverNetworkSystem: EngineSystem = {
  install(engine) {
    engine.registry.register(ServerNetworkServiceElement);
    const networkService = new ServerNetworkServiceElement();

    engine.document.append(networkService);

    engine.afterTickHandlers.push(() => {
      networkService.broadcastSnapshot(engine.registry, engine.document);
    });
    engine.destroyHandlers.push(() => {
      networkService.destroy();
    });
  },
};

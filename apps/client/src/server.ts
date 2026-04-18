import { Engine } from "@webgames/engine";
import { gameSystem } from "@webgames/game";
import { serverNetworkSystem } from "@webgames/network-server";
import { loadGameFile } from "@webgames/parser";
import { createPhysicsSystem } from "@webgames/physics";
import { ScriptSystem } from "@webgames/script";
import { uiSystem } from "@webgames/ui";
import { createEditor } from "./editor";

const app = document.querySelector<HTMLDivElement>("#app");

if (app === null) {
  throw new Error("App element not found");
}

// On the server tab, only the editor should render. Hide any other direct
// children of body (notably game elements added by the parser/snapshots).
app.setAttribute("data-no-replicate", "");
const hideStyle = document.createElement("style");
hideStyle.textContent =
  "body > :not([data-no-replicate]) { display: none !important; }";
document.head.append(hideStyle);

let engine: Engine | null = null;
let reloadTimer: ReturnType<typeof setTimeout> | null = null;

const editor = createEditor((text) => {
  if (reloadTimer !== null) {
    clearTimeout(reloadTimer);
  }

  reloadTimer = setTimeout(() => {
    reloadTimer = null;
    reloadEngine(text);
  }, 300);
});

editor.style.position = "fixed";
editor.style.inset = "0";

app.append(editor);

let previousSeconds = 0;
requestAnimationFrame(function frame(time) {
  const seconds = time * 0.001;
  const deltaTime = previousSeconds === 0 ? 0 : seconds - previousSeconds;
  previousSeconds = seconds;

  engine?.tick(deltaTime);
  requestAnimationFrame(frame);
});

async function reloadEngine(text: string): Promise<void> {
  engine?.destroy();
  engine = null;

  try {
    engine = await createServerEngine(text);
  } catch (error) {
    console.error("Failed to load game file:", error);
  }
}

async function createServerEngine(text: string): Promise<Engine> {
  const engine = new Engine([
    gameSystem,
    new ScriptSystem(),
    await createPhysicsSystem(),
    uiSystem,
    serverNetworkSystem,
  ]);

  try {
    loadGameFile(engine, text);
    return engine;
  } catch (error) {
    engine.destroy();
    throw error;
  }
}

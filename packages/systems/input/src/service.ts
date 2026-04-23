import { Element } from "@webgames/engine";

type InputState = {
  down: Set<string>;
  pressed: Set<string>;
  released: Set<string>;
};

const stateByElement = new WeakMap<HTMLElement, InputState>();

export class InputServiceElement extends Element {
  static readonly tag: string = "input-service";
  static readonly replicated: boolean = false;

  constructor(element: HTMLElement) {
    super(element);
    getState(this.element);
  }

  isDown(code: string): boolean {
    return getState(this.element).down.has(code);
  }

  wasPressed(code: string): boolean {
    return getState(this.element).pressed.has(code);
  }

  wasReleased(code: string): boolean {
    return getState(this.element).released.has(code);
  }

  pressKey(code: string): void {
    const state = getState(this.element);

    if (state.down.has(code)) {
      return;
    }

    state.down.add(code);
    state.pressed.add(code);
  }

  releaseKey(code: string): void {
    const state = getState(this.element);

    if (!state.down.has(code)) {
      return;
    }

    state.down.delete(code);
    state.released.add(code);
  }

  clearFrame(): void {
    const state = getState(this.element);

    state.pressed.clear();
    state.released.clear();
  }

  reset(): void {
    getState(this.element).down.clear();
    this.clearFrame();
  }
}

function getState(element: HTMLElement): InputState {
  let state = stateByElement.get(element);

  if (state !== undefined) {
    return state;
  }

  state = {
    down: new Set(),
    pressed: new Set(),
    released: new Set(),
  };
  stateByElement.set(element, state);
  return state;
}

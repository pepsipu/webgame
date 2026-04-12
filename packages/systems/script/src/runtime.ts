export class ScriptState {
  source: string;
  #tick: ((deltaTime: number) => void) | null;

  constructor(source: string) {
    this.source = source;
    this.#tick = null;
  }

  tick(deltaTime: number): void {
    if (this.#tick === null) {
      try {
        // lazily initialize the script at the first tick
        const getTick = new Function(
          this.source +
            '\nreturn typeof tick === "function" ? tick : undefined;',
        );
        this.#tick = getTick() ?? null;
      } catch (error) {
        console.error("Script evaluation error:", error);
        this.#tick = null;
      }
    }

    // execute the tick function if it exists
    try {
      this.#tick?.(deltaTime);
    } catch (error) {
      console.error("Script tick error:", error);
    }
  }

  destroy(): void {
    this.#tick = null;
  }
}

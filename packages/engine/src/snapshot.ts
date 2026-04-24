export interface ElementSnapshot extends Record<string, unknown> {
  tag: string;
  attributes?: Record<string, string>;
  text?: string;
  children?: ElementSnapshot[];
}

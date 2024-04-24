export interface RenderConfiguration {
  width: number;
}

export class RenderConfiguration implements RenderConfiguration {
  width = 480;

  constructor(configuration?: Partial<RenderConfiguration>) {
    Object.assign(this, configuration);
  }
}

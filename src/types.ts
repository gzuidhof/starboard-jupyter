export interface JupyterPluginSettings {
  serverSettings?: {
    baseUrl: string;
    token: string;
  };
  /** HTML Element to mount the Jupyter Manager UI on */
  mount?: HTMLElement;
}

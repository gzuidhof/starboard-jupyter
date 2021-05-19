export interface JupyterPluginSettings {
  serverSettings?: {
    baseUrl: string;
    token: string;
  };
  /** HTML Element to mount the Jupyter Manager UI on */
  mount?: HTMLElement;
  /** Hides the <Starboard Jupyter Plugin> header of the widget */
  headerText: string;
}

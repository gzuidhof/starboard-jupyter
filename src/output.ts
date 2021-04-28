import { OutputArea, OutputAreaModel } from "@jupyterlab/outputarea";

import {
    RenderMimeRegistry,
    standardRendererFactories
  } from '@jupyterlab/rendermime';


export function createJupyterOutputArea() {
    const model = new OutputAreaModel();
    const rendermime = new RenderMimeRegistry({ initialFactories: standardRendererFactories });
    const outputArea = new OutputArea({ model, rendermime });
    return outputArea;
}

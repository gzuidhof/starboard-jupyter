
import { OutputArea, OutputAreaModel } from '@jupyterlab/outputarea';

import {
    RenderMimeRegistry,
    standardRendererFactories as initialFactories
  } from '@jupyterlab/rendermime';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';

export async function runCodeInJupyter(kernel: IKernelConnection, code: string) {
  const model = new OutputAreaModel();
  const rendermime = new RenderMimeRegistry({ initialFactories });
  const outputArea = new OutputArea({ model, rendermime });
  outputArea.future = kernel.requestExecute({ code });

  return outputArea;
}
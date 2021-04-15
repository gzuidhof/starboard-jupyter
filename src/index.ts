import { CellTypeDefinition, CellHandlerAttachParameters, CellElements, Cell } from "starboard-notebook/dist/src/types";
import * as lithtmlImport from "lit-html";
import { Runtime, ControlButton } from "starboard-notebook/dist/src/runtime";

import "./styles";
import { JupyterPluginSettings } from "./types";
import { StarboardJupyterManager } from "./components/kernelManager";
import { OutputArea, OutputAreaModel, } from "@jupyterlab/outputarea";

import {
    RenderMimeRegistry,
    standardRendererFactories
  } from '@jupyterlab/rendermime';

declare global {
    interface Window {
      runtime: Runtime
      $_: any;
    }
}

let hasBeenRegistered = false;

export function registerJupyter(jupyterOpts: JupyterPluginSettings) {
    if (hasBeenRegistered) return;
    hasBeenRegistered = true;

    /* These globals are exposed by Starboard Notebook. We can re-use them so we don't have to bundle them again. */
    const runtime = window.runtime;
    const lithtml = runtime.exports.libraries.LitHtml;

    const StarboardTextEditor = runtime.exports.elements.StarboardTextEditor;
    const cellControlsTemplate = runtime.exports.templates.cellControls;
    const icons = runtime.exports.templates.icons;

    const globalKernelManager = new StarboardJupyterManager(jupyterOpts);

    const JUPYTER_CELL_TYPE_DEFINITION: CellTypeDefinition = {
        name: "Jupyter",
        cellType: ["jupyter"],
        createHandler: (cell: Cell, runtime: Runtime) => new JupyterCellHandler(cell, runtime),
    }

    class JupyterCellHandler {
        private elements!: CellElements;
        private editor: any;
        private outputArea: OutputArea;

        private lastRunId = 0;
        private isCurrentlyRunning: boolean = false;

        cell: Cell;
        runtime: Runtime;

        constructor(cell: Cell, runtime: Runtime) {
            this.cell = cell;
            this.runtime = runtime;

            const model = new OutputAreaModel();
            const rendermime = new RenderMimeRegistry({ initialFactories: standardRendererFactories });
            this.outputArea = new OutputArea({ model, rendermime });
        }

        private getControls(): lithtmlImport.TemplateResult | string {
            const icon = this.isCurrentlyRunning ? icons.ClockIcon : icons.PlayCircleIcon;
            const tooltip = this.isCurrentlyRunning ? "Cell is running" : "Run Cell";
            const runButton: ControlButton = {
                icon,
                tooltip,
                callback: () => this.runtime.controls.emit({id: this.cell.id, type: "RUN_CELL"}),
            };
            let buttons = [runButton];

            return cellControlsTemplate({ buttons });
        }

        attach(params: CellHandlerAttachParameters): void {
            this.elements = params.elements;

            const topElement = this.elements.topElement;
            lithtml.render(this.getControls(), this.elements.topControlsElement);

            this.editor = new StarboardTextEditor(this.cell, this.runtime, {language: "python"});
            topElement.appendChild(this.editor);

            this.elements.bottomElement.appendChild(this.outputArea.node);
        }

        async run() {
            const codeToRun = this.cell.textContent;
            
            this.lastRunId++;
            const currentRunId = this.lastRunId;
            this.isCurrentlyRunning = true;
            lithtml.render(this.getControls(), this.elements.topControlsElement);

            await globalKernelManager.runCode({code: codeToRun}, this.outputArea);
            await this.outputArea.future.done;
            
            if (this.lastRunId === currentRunId) {
                this.isCurrentlyRunning = false;
                lithtml.render(this.getControls(), this.elements.topControlsElement);
            }

            const val = this.outputArea.model.toJSON();
            window.$_ = val
            return val;
        }

        focusEditor() {
            this.editor.focus();
        }

        async dispose() {
            this.editor.remove();
        }
    }

    runtime.definitions.cellTypes.register(JUPYTER_CELL_TYPE_DEFINITION.cellType, JUPYTER_CELL_TYPE_DEFINITION);
    
    const nb = document.querySelector("starboard-notebook");
    if (nb) nb.prepend(globalKernelManager)
}

(window as any).registerJupyterPlugin = registerJupyter;
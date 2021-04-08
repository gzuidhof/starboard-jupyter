import { CellTypeDefinition, CellHandlerAttachParameters, CellElements, Cell } from "starboard-notebook/dist/src/types";
import * as lithtmlImport from "lit-html";
import { Runtime, ControlButton } from "starboard-notebook/dist/src/runtime";
import { KernelManager } from "@jupyterlab/services";
import * as P from "@jupyterlab/services/lib/serverconnection"
import { runCodeInJupyter } from "./output";

import "./styles";



declare global {
    interface Window {
      runtime: Runtime
      $_: any;
    }
}

export function registerJupyter(kernelSettings: {serverSettings: any}) {
    /* These globals are exposed by Starboard Notebook. We can re-use them so we don't have to bundle them again. */
    const runtime = window.runtime;
    const lithtml = runtime.exports.libraries.LitHtml;

    const StarboardTextEditor = runtime.exports.elements.StarboardTextEditor;
    const cellControlsTemplate = runtime.exports.templates.cellControls;
    const icons = runtime.exports.templates.icons;

    const JUPYTER_CELL_TYPE_DEFINITION: CellTypeDefinition = {
        name: "Jupyter",
        // @ts-ignore Ignore to be removed after updating typings.
        cellType: ["jupyter"],
        createHandler: (cell: Cell, runtime: Runtime) => new JupyterCellHandler(cell, runtime),
    }

    class JupyterCellHandler {
        private elements!: CellElements;
        private editor: any;

        private lastRunId = 0;
        private isCurrentlyRunning: boolean = false;

        cell: Cell;
        runtime: Runtime;

        constructor(cell: Cell, runtime: Runtime) {
            this.cell = cell;
            this.runtime = runtime;
        }

        private getControls(): lithtmlImport.TemplateResult | string {
            const icon = this.isCurrentlyRunning ? icons.ClockIcon : icons.PlayCircleIcon;
            const tooltip = this.isCurrentlyRunning ? "Run Cell": "Cell is running";
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
        }

        async run() {
            const kernelManager = new KernelManager({
                standby: "when-hidden",
                serverSettings: P.ServerConnection.makeSettings(kernelSettings.serverSettings)
            });
            const kernel = await kernelManager.startNew();

            console.log(kernel);

            const codeToRun = this.cell.textContent;
            

            const el = await runCodeInJupyter(kernel, codeToRun);
            this.elements.bottomElement.innerHTML = ""; // Drop any existing output els
            this.elements.bottomElement.appendChild(el.node);

            this.lastRunId++;
            const currentRunId = this.lastRunId;
            this.isCurrentlyRunning = true;

            const val = 0;
            // const val = await runStarboardPython(this.runtime, codeToRun, this.elements.bottomElement);
            if (this.lastRunId === currentRunId) {
                this.isCurrentlyRunning = false;
                lithtml.render(this.getControls(), this.elements.topControlsElement);
            }

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
}

(window as any).registerJupyterPlugin = registerJupyter;
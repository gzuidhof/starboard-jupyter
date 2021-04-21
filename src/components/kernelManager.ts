import { Kernel, KernelManager, KernelMessage } from "@jupyterlab/services";
import { JupyterPluginSettings } from "../types";

import * as P from "@jupyterlab/services/lib/serverconnection"
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { OutputArea } from "@jupyterlab/outputarea";

const LitElement = window.runtime.exports.libraries.LitElement;
const html = LitElement.html;

@LitElement.customElement('starboard-jupyter-manager')
export class StarboardJupyterManager extends LitElement.LitElement  {
    private settings: JupyterPluginSettings;
    private manager: KernelManager;

    private isReady = false;
    private runningKernels: Kernel.IModel[] = []; 

    private currentKernel?: IKernelConnection;
    private connectionError: Error | undefined;

    constructor(jupyterSettings: JupyterPluginSettings) {
        super();
        this.settings = jupyterSettings;

        this.manager = new KernelManager({
            standby: "when-hidden",
            serverSettings: P.ServerConnection.makeSettings(jupyterSettings.serverSettings)
        });

        this.manager.connectionFailure.connect((km, err) => {
            console.warn("Jupyter Connection Failure", err);
            this.connectionError = err;
            this.performUpdate();
        }, this)

        this.manager.ready.then(() => {
            this.isReady = true;
            this.performUpdate();
        });

        this.manager.runningChanged.connect((km, running) => {
            this.runningKernels = running;
            this.connectionError = undefined;
            this.performUpdate();
        }, this);
    }

    private setupKernelConnection() {
        this.currentKernel!.statusChanged.connect((kc, status) => {
            if (status === "dead" && this.currentKernel) {
                this.currentKernel.dispose();
                this.currentKernel = undefined;
            }
            this.performUpdate()
        });
        this.currentKernel!.connectionStatusChanged.connect((kc, status) => {this.performUpdate()});
        this.manager.refreshRunning();
    }

    createRenderRoot() {
        return this;
    }

    async startKernel(name?: string, shutdownCurrentKernel?: boolean) {
        if (shutdownCurrentKernel && this.currentKernel && !this.currentKernel.isDisposed) {
            console.error("Already connected to a kernel, shutting down existing kernel");
            await this.currentKernel.shutdown();
            this.currentKernel.dispose();
        }
        this.currentKernel = await this.manager.startNew({name: name});
        this.setupKernelConnection();
        this.performUpdate();
    }

    async connectToKernel(id: string) {
        if (this.currentKernel && !this.currentKernel.isDisposed) {
            this.currentKernel.dispose();
            this.currentKernel = undefined;
        }

        this.currentKernel = this.manager.connectTo({model: {name: "", id}});
        this.setupKernelConnection();
        this.performUpdate();
    }

    async shutdownKernel(id: string) {
        this.manager.shutdown(id);
    }

    async interruptKernel() {
        if (this.currentKernel) {
            this.currentKernel.interrupt();
        }
    }

    async disconnectFromKernel() {
        if (this.currentKernel) {
            this.currentKernel.dispose();
            this.currentKernel = undefined;
            this.performUpdate();
        }
    }

    /**
     * Takes an object with a `code` field.
     * There are more parameters which you probably won't need.
     */
    async runCode(content: KernelMessage.IExecuteRequestMsg['content'], output: OutputArea) {
        if (!this.currentKernel) {
            await this.startKernel();
        }

        output.future = this.currentKernel!.requestExecute(content);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        (async () => {
            if (this.currentKernel) {
                await this.manager.shutdown(this.currentKernel.id);
            }
            this.manager.dispose()
        })();
        this.manager.refreshRunning
    }

    render() {
        return html`
                <section class="starboard-jupyter-interface py-2 px-3 my-2">
                    <details>
                    <summary class="d-flex justify-content-between flex-wrap">
                        <div class="d-flex align-items-center flex-wrap">
                            <h2 class="h5 mb-0 me-2">Starboard Jupyter Plugin</h2>
                            ${
                                this.connectionError ?
                                html`<div class="badge bg-danger" style="width: max-content">Connection Error</div>`
                                : this.isReady ? 
                                  html`<div class="badge bg-success small" style="width: max-content">✅ OK</div>`
                                  : html`<div class="badge bg-light text-dark" style="width: max-content">Connecting to Jupyter..</div>`
                            }

                        </div>
                        
                        <div>
                        ${
                            this.currentKernel ? 
                                html`
                                    
                                    <span class="badge ${this.currentKernel.connectionStatus === "connected" ? "bg-success": "bg-warning text-dark"}" >
                                        ${this.currentKernel.connectionStatus}
                                    </span>
                                    <span title="Kernel Status" class="badge bg-dark">
                                        ${this.currentKernel.status}
                                    </span>
                                    <button @click=${() => this.interruptKernel()} title="Interrupt Kernel" class="btn btn-outline-secondary btn-sm btn-rounded py-0">Interrupt</button>`
                                : html`<span class="badge bg-light text-dark">Not connected to a kernel</span>`
                        }</div>
                    </summary>
                    ${this.isReady ? 
                    html`
                        ${
                            // this.connectionError ?
                            // html`<button @click=${() => this.attemptReconnect()} class="ms-3 mt-2 btn btn-sm btn-outline-primary">Force Retry Connection</button>` :
                            html`<button @click=${() => this.startKernel()} class="mt-2 btn btn-sm btn-outline-primary">Start new Kernel</button>`
                        }
                        <ul class="list-group m-3">
                            ${this.runningKernels.map(v => {
                                if (this.currentKernel && this.currentKernel.id === v.id) {
                                    return html`<li class="list-group-item bg-light text-dark list-group-item-action d-flex justify-content-between align-items-center">
                                            <span>🔗 <b>${v.name}</b> <code>${v.id}</code></span>

                                            <div class="d-flex align-items-center">
                                                    <button @click=${() => this.disconnectFromKernel()} class="btn btn-sm btn-outline-secondary me-2 text-dark bg-white">Disconnect</button>  
                                                    <!-- <button @click=${() => this.shutdownKernel(v.id)} class="btn btn-sm btn-outline-secondary me-2 text-dark">Shut Down</button> -->
                                                    <span title="Last Activity: ${(v as any).last_activity}" class="badge bg-primary rounded-pill">
                                                        ${this.currentKernel.status}
                                                    </span>
                                            </div>


                                        </li>`
                                } else {
                                    return html`<div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                            <span><b>${v.name}</b> <code>${v.id}</code></span>
                                                <div class="d-flex align-items-center">
                                                    <button @click=${() => this.connectToKernel(v.id)} class="btn btn-sm btn-outline-primary me-2">Connect</button>  
                                                    <button @click=${() => this.shutdownKernel(v.id)} class="btn btn-sm btn-outline-primary me-2">Shut Down</button>
                                                    <span title="Last Activity: ${(v as any).last_activity}" class="badge bg-primary rounded-pill">
                                                        ${(v as any).execution_state}
                                                    </span>
                                                </div>
                                            </div>
                                </div>`
                                }

                            })}
                        </ul>`
                        : undefined}

                        ${this.connectionError ? html`
                            <div class="alert alert-danger mt-2">
                                <b>Connection Error</b>
                                <p>${this.connectionError}</p><br>
                                <p class="small">Check the Network tab in your browser's developer console for more details.</p>
                            
                            </div>`: undefined
                        }
                        
                    </details>
                </section>
                
        `;
    }

}

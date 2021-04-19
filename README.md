# starboard-jupyter
Experiment for support of Starboard cells that are backed by a Jupyter kernel.

## Screenshot
![](https://i.imgur.com/WFyAi5R.png)

## Setup


### 1. Install Jupyter Kernel Gateway

```
pip install jupyter_kernel_gateway
```

### 2. Start the Jupyter Kernel gateway:
```
jupyter kernelgateway --KernelGatewayApp.allow_origin="https://gz.starboard.host" --KernelGatewayApp.allow_headers="authorization,content-type" --JupyterWebsocketPersonality.list_kernels=True
```
*(change the origin to be the origin where you are hosting your notebook sandbox)*

> Note 1: right now auth with a token doesn't work for the websocket connection. The token simply doesn't get passed from the client, so for now there is no auth other than the origin check (and the fact that you can stay entirely within localhost). When that is fixed you should add `--KernelGatewayApp.auth_token="my-super-strong-secret-example"`

> Note 2: It also works with a plain Jupyter Notebook or JupyterLab, but you will need to allow the origins and set the auth token with another method.

### 3. Initialize the plugin in your notebook

You can use [this notebook](https://starboard.gg/nb/nA3wm87) to try it out.

```javascript
// Or wherever you are hosting it, could be from some CDN.
import "http://localhost:8080/dist/starboard-jupyter.js";

registerJupyterPlugin({
    serverSettings: {
        baseUrl: "http://localhost:8888",
        token: "my-super-strong-secret-example",
    }
})
```

### 4. Create Jupyter cells

Who even needs Jupyter's interface anymore? ;)

## License

[MIT](./LICENSE)
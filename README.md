# starboard-jupyter
Experiment for support of Starboard cells that are backed by a Jupyter kernel.

## Screenshot
![](https://i.imgur.com/4XlMPf8.png)

## Setup

### 1. Set up CORS to allow connections from notebook origins

Your Jupyter or JupyterLab settings need to allow for connections from the origin you are running your notebook on.

First create the config file:
```shell
jupyter lab --generate-config
```

The path to the config file will be printed. It is generally in your home directory under `.jupyter/jupyter_lab_config.py`. In this file change the following config value:

```python
c.ServerApp.allow_origin_pat = 'http://localhost:*'

# OPTIONAL
c.ServerApp.token = 'somestrongsecret'
```

Of course you can make it more specific if you know the exact origin your notebook will run on.

> Note: It also works with a plain "Jupyter Notebook" server instead of JupyterLab, but the config value keys will be slightly different.

### 2. Start a Jupyter lab server
```
> jupyter lab --no-browser
```

If you didn't set your own auth token in the config file, take note of the output when you run this and copy the token in the URL.

### 3. Initialize the plugin in your notebook

```javascript
// Or wherever you are hosting it, could be from some CDN.
import "http://localhost:8080/dist/starboard-jupyter.js";

registerJupyterPlugin({
    serverSettings: {
        baseUrl: "http://localhost:8888",
        token: "somestrongsecret",
    }
})
```

### 4. Create Jupyter cells

Who even needs Jupyter's interface anymore? ;)

## License

[MIT](./LICENSE)
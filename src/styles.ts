import '@jupyterlab/rendermime/style/index.js';
import '@jupyterlab/outputarea/style/index.js';
import '@jupyterlab/theme-light-extension/style/index.js';

// Oh my god this is awful, but as Jupyter has its own reset it's kind of necessary..
import "starboard-notebook/dist/starboard-notebook.css";
import './additionalStyles.css';

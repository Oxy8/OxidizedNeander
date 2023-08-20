import init from '../pkg/oxidized_neander.js';

async function Start() {
    await init();
    // index.jsx is not imported at the top-level because it would trigger the loading
    // of all the import chain, which contains wasm functions.
    // Trying to import wasm functions before init (initialization completion indicator)
    // is problematic because we may be trying to import a function that hasn't been loaded yet.
    let { RenderApp } = await import('./app.jsx');
    RenderApp();
  }
  
Start();




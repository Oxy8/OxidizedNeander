import { render } from 'solid-js/web';

import { Memory } from "./memory.jsx";
import { MemoryMnemonics } from "./memory_mnemonics.jsx";
import { Buttons } from "./buttons.jsx";
import { Indicators } from "./indicators.jsx";
import { ImportExport } from "./files.jsx";

const root = document.getElementById('root');

export function App() {
  
  return (
    <div class="app">
      <div class="left-side">
        <Memory/>
        <MemoryMnemonics/>
      </div>
      <div class="right-side">
        <Indicators/>
        <Buttons/>
        <ImportExport/>
      </div>
    </div>
  );
}

export function RenderApp() {
  render(() => <App />, root);
}


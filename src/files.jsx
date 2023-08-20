import { state, setState } from "./signals.js";
import { get_exportable_memory } from '../pkg/oxidized_neander.js';



function importMemory() {
    return 0;
}

function exportMemory() {
    
    const data = get_exportable_memory(state.memory).memory;
    // Blob requires a normal array, so wrap Uint8Array in brackets ("[data]")
    var blob = new Blob([data], {type:"application/octet-stream"});

    const href = URL.createObjectURL(blob);

    const a = document.createElement('a')
    a.href = href;
    a.download = "memory_state.mem";
    a.style.visibility = "hidden";
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(href);
    
    return 0;
}

export function ImportExport() {
    // "Importing a memory save is going to overwrite the information you've entered.
    // Are you sure you want to continue?"

    return (
        <div class="import/export">
            <form>
                <input
                    type="file"
                    accept=".mem,application/octet-stream"
                    onchange={(e) => {importMemory(e.target.value)}}></input>
            </form>
            <button onClick={(e) => exportMemory()}>Export</button>
        </div>
    )
}


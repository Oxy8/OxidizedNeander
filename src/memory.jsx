import { For } from 'solid-js';

import { state, setMemAddressWVerification } from "./signals.js";

import { base, baseSize } from "./base.js";


// <div class="memory clip-text"> works, but input fields disappear
export function Memory() {      

    return (
        <div class="memory">
            <form id="form1" onSubmit={() => {event.preventDefault();}}/>
            
            <For each={state.memory}>{(address, index) =>
                <div class="one-line">
                    <p class="indices">{index().toString().padStart(3, "0")}</p>
                    
                    <div class="memory">
                        <input 
                            form="form1"
                            maxlength={baseSize()}
                            value={address.toString(base()).padStart(baseSize(), "0")}
                            onChange={
                                (e) => {setMemAddressWVerification(index(), parseInt(e.target.value, base()))
                        }}
                        /><br/>
                    </div>
                </div>
            }</For>
        </div>
    )
}
// De orrriginal spaghetti, with voiy long strrrings

// MemoryMnemonics needs to be dynamic, else not updating.
// maybe createEffect here.
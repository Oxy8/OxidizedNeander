import { stateRun, stateStep, stateReset } from './run.js';
import { getBaseName, switchBase } from './base.js';


export function Buttons() {

    return (
    <div class="buttons">
        <button onClick={(e) => stateRun()}>Run</button>
        <button onClick={(e) => stateStep()}>Step</button>
        <button onClick={(e) => stateReset()}>Reset</button>
        <br/>
        <button onClick={(e) => switchBase()}>Base: {getBaseName()}</button>
    </div>
    )
}




// maybe buttons and indicators should be joined together.
// Neither program_counter nor setBase fit very well in any of the two
// categories, but giving them an exclusive element is excessive.
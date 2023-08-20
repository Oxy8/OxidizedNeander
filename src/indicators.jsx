
import { state } from "./signals.js";

export function Indicators() {
    return (
    <div class="indicators">
        <p>ACC: {state.accumulator.toString()}</p>
        <p>PC: {state.program_counter.toString()}</p>
        <p>N: {state.n_indicator.toString()}</p>
        <p>Z: {state.z_indicator.toString()}</p>
        <p>HALT: {state.halt.toString()}</p>
    </div>
    )
}

// Should any of the items above other than the program_counter be input field?
// probably non-problematic, create a form instead of a div, and add everything
// inside as input fields



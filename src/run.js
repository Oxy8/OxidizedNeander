import { state, setState } from "./signals.js";
import { createSignal } from "solid-js";
import { unwrap } from "solid-js/store";

import { update_state, update_state_until_halt, get_default_processor_state } from '../pkg/oxidized_neander.js';

// Initial value as if we'd just restarted the state.
// Don't see the need for creating a signal here, but removing it makes things stop working.
const [backup, setBackup] = createSignal(get_default_processor_state());
let resetted_flag = true;


// setBackupState only does something if the last thing we did was reset the state.
function setBackupState() {

    if (resetted_flag) {
        setBackup(structuredClone(unwrap(state)));
        resetted_flag = false;
    }
}

export async function stateRun() {
    await setBackupState();
    setState(update_state_until_halt(state));
}

export async function stateStep() {
    await setBackupState();
    setState(update_state(state));
}

export function stateReset() {
    if (!resetted_flag) {
        setState(backup());
        resetted_flag = true;
    }
}

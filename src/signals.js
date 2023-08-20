import { createStore } from "solid-js/store";

import { get_default_processor_state } from '../pkg/oxidized_neander.js';

const [state, setState] = createStore(get_default_processor_state());

function setMemAddress(address, value) {
  setState('memory', [address], value);
}


// As input is now of type string, and not number, need to create a verifying step to ensure 
// it is a number and is between 0 and 255.
function setMemAddressWVerification(address, value) {
  let integer = parseInt(value);
  if (!isNaN(integer) && (0 <= integer) && (integer <= 255)) {
    setMemAddress(address, integer);
  } else {
    console.log("Failed to set address %i", address);
  }
}

setMemAddress(128,  250);
setMemAddress(129,  60);
setMemAddress(0, 32);
setMemAddress(1, 128);
setMemAddress(2, 48);
setMemAddress(3, 129);
setMemAddress(4, 16);
setMemAddress(5, 130);
setMemAddress(10, 240);

export {
  state, setState, setMemAddress, setMemAddressWVerification
};


// State is not a function that returns a value, but a variable containing a value,
// as such, using setState is pretty much always better done by setting fields instead of grabbing
// the entire state, modifying it and setting it.
// This is of course only secondary to the fact that updating the entire state is not good for performance
// but its mostly a reminder to stick to the default process even when performance doesnt matter.
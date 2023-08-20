import { createMemo } from 'solid-js';
import { state, setState } from "./signals.js";
import { get_mnemonics } from '../pkg/oxidized_neander.js';


function unwrapMnemonic(mnemonic) {
  let instruction = mnemonic.instruction;
  let data = mnemonic.operand;

  switch (instruction) {
    case 0:
        return(<p style="visibility: hidden">NOP</p>)
    case 16:
        return(<p style="color: #44AA99">STA {data}</p>)
    case 32:
        return(<p style="color: #117733">LDA {data}</p>)
    case 48:
        return(<p style="color: #88CCEE">ADD {data}</p>)
    case 64:
        return(<p style="color: Orange">OR {data}</p>)
    case 80:
        return(<p style="color: Yellow">AND {data}</p>)
    case 96:
        return(<p style="color: #DDCC77">NOT</p>)
    case 128:
        return(<p style="color: #AA4499">JMP {data}</p>)
    case 144:
        return(<p style="color: #CC6677">JN {data}</p>)
    case 160:
        return(<p style="color: #882255">JZ {data}</p>)
    case 240:
        return(<p style="color: Salmon">HLT</p>)
    default:
        return(<p style="color: #D00000">ERR</p>)
  }
}

const mnemonics_array = createMemo(() => {
    try {
      const mnemonics = get_mnemonics(state.memory);
      console.log("updated_mnemonics");
      return (mnemonics.map(mnemonic => unwrapMnemonic(mnemonic)));
    }
    catch (error) {
      console.error('Error occurred while retrieving mnemonics:', error);
      let array = [<p>{error}</p>];
      return (array);
    }
});

export function MemoryMnemonics() { 
  return (
    <div class="mnemonics">
      <br/>
        <For each={mnemonics_array()}>
          {(mnemonic) => <>{mnemonic}</>}
        </For>
    </div>
  )
}

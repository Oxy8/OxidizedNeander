#![feature(iterator_try_collect)]
#![feature(iter_intersperse)]

use serde::{Serialize, Deserialize};
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::wasm_bindgen;
use std::ops::*;
use std::iter;

//--------------------------------------------------------------------//

#[derive(Default)]
#[derive(Serialize, Deserialize)]
pub struct ProcessorState {
    #[serde(with = "serde_bytes")]
    memory: Vec<u8>,
    n_indicator: bool,
    z_indicator: bool,
    program_counter: u8,
    accumulator: u8,
    halt: bool,
}

pub fn update_state_inner(state: ProcessorState) -> Result<ProcessorState, String> {

    let mut memory: Vec<u8> = state.memory;
    let mut n_indicator: bool = state.n_indicator;
    let mut z_indicator: bool = state.z_indicator;
    let mut program_counter: u8 = state.program_counter;
    let mut accumulator: u8 = state.accumulator;
    let mut halt: bool = state.halt;

    let mut jump: bool = false;
    let mut negate: bool = false;

    let mut current_address: u8 = memory[program_counter as usize];

    match (current_address & 0b00001111) {
        0b00000000 => (),
        0b00010000 => {  
            program_counter = program_counter.wrapping_add(1);
            current_address = memory[program_counter as usize];
            memory[current_address as usize] = accumulator;
        }
        0b00100000 => {  
            program_counter = program_counter.wrapping_add(1);
            accumulator = memory[memory[program_counter as usize] as usize];
        }
        0b00110000 => {  
            program_counter = program_counter.wrapping_add(1);
            accumulator = accumulator.wrapping_add(memory[memory[program_counter as usize] as usize]);
        }
        0b01000000 => {  
            program_counter = program_counter.wrapping_add(1);
            accumulator = accumulator.bitor(memory[memory[program_counter as usize] as usize]);
        }
        0b01010000 => {  
            program_counter = program_counter.wrapping_add(1);
            accumulator = accumulator.bitand(memory[memory[program_counter as usize] as usize]);
        }
        0b01100000 => {   
            accumulator = accumulator.not();
            negate = true;
        }
        0b10000000 => {
            program_counter = program_counter.wrapping_add(1);
            program_counter = memory[program_counter as usize];
            jump = true; // as we are just jumping, there is no need to update PC, N or Z.
        }
        0b10010000 => {
            program_counter = program_counter.wrapping_add(1);
            if n_indicator {
                program_counter = memory[program_counter as usize];
                jump = true; // as we are just jumping, there is no need to update PC, N or Z.
            }
        }
        0b10100000 => {
            program_counter = program_counter.wrapping_add(1);
            if z_indicator {
                program_counter = memory[program_counter as usize];
                jump = true; // as we are just jumping, there is no need to update PC, N or Z.
            }
        }
        0b11110000 => {
            halt = true;
        }
        instruction => {
            return Err(format!("Unknown instruction {instruction:b} at memory address {program_counter}"))
        }
    }

    if !jump {
        if !negate {program_counter = program_counter.wrapping_add(1)};

        z_indicator = accumulator == 0;
        n_indicator = accumulator >= 128;
    }

    Ok(ProcessorState {
        memory: memory,
        n_indicator: n_indicator,
        z_indicator: z_indicator,
        program_counter: program_counter,
        accumulator: accumulator,
        halt: halt
    })
}

#[wasm_bindgen]
pub fn update_state(processor_state: JsValue) -> Result<JsValue, JsValue> {
    let mut state: ProcessorState = serde_wasm_bindgen::from_value(processor_state)?;
    
    if !state.halt {
        state = update_state_inner(state)?;
    }

    Ok(serde_wasm_bindgen::to_value(&state)?)
    // ? acts as an into() in case of an Err, generating a JsValue output
}

#[wasm_bindgen]
pub fn update_state_until_halt(processor_state: JsValue) -> Result<JsValue, JsValue> {
    let mut state: ProcessorState = serde_wasm_bindgen::from_value(processor_state)?;
    
    while !state.halt {
        state = update_state_inner(state)?;
    }

    Ok(serde_wasm_bindgen::to_value(&state)?)
    // ? acts as an into() in case of an Err, generating a JsValue output  
}

//--------------------------------------------------------------------//

#[wasm_bindgen]
pub fn get_default_processor_state() -> Result<JsValue, JsValue> {
    let memory: Vec<u8> = vec![0; 256];
    let processor_state: ProcessorState = ProcessorState { memory: memory,..Default::default() };
    // memory needs to be initialized in order to have 256 values.

    Ok(serde_wasm_bindgen::to_value(&processor_state)?)
}

//--------------------------------------------------------------------//

#[derive(Serialize, Deserialize)]
pub struct MnemonicData {
    instruction: u8,
    operand: Option<u8>,
}

fn get_mnemonics_inner(instruction: u8, data: u8, skip: &mut bool) -> Result<MnemonicData, String> {
    if *skip {
        *skip = false;
        return Ok(MnemonicData { instruction: 0b00000000, operand: None })
    }

    match instruction {
        //  NOP          NOT          HLT
        0b00000000 | 0b01100000 | 0b11110000 => {
            return Ok(MnemonicData { instruction: instruction, operand: None })
        }
        0b00010000 | 0b00100000 | 0b00110000 | 0b01000000 | 0b01010000 | 0b10000000 | 0b10010000 | 0b10100000  => {
            *skip = true;  // as the next address is just data, we can skip
            return Ok(MnemonicData { instruction: instruction, operand: Some(data) })
        }
        _ => {
            return Err(String::from("Unknown instruction"))
        }
    }
}

#[wasm_bindgen]
pub fn get_mnemonics(memory: JsValue) -> Result<JsValue, JsValue> {
    let mut memory: Vec<u8> = serde_wasm_bindgen::from_value(memory)?;
    // Memory is truncated to 129 because calling windows() returns one less element.
    // The last element will contain the data from address 128, but it is better to
    // keep it like that in case a halt is inserted at address 127.
    memory.truncate(129);

    let mut skip_next: bool = false;
    let mnemonics: Vec<MnemonicData> = memory
        .windows(2) 
        .map(|window| get_mnemonics_inner(window[0], window[1], &mut skip_next))
        .try_collect::<Vec<MnemonicData>>()?;
    
    Ok(serde_wasm_bindgen::to_value(&mnemonics)?)
}

//--------------------------------------------------------------------//

#[derive(Serialize, Deserialize)]
pub struct MemoryImportExport {
    #[serde(with = "serde_bytes")]
    memory: Vec<u8>,
}

#[wasm_bindgen]
pub fn get_exportable_memory(memory: JsValue) -> Result<JsValue, JsValue> {
    let memory: Vec<u8> = serde_wasm_bindgen::from_value(memory)?;
    
    let data: Vec<u8> = [3, 78, 68, 82] // End of text + "NDR"
    .into_iter()
    .chain(memory.into_iter().intersperse(u8::MIN))
    .chain(iter::once(u8::MIN))
    .collect();

    Ok(serde_wasm_bindgen::to_value(&MemoryImportExport {memory: data})?)
}

//--------------------------------------------------------------------//


// mnemonics need to be reworked.
// it works but it is not pretty, and it's not modular
// enough to help with importing/exporting .mem files.
// Ideally, i would be able to craft my own markup inside
// rust files, instead of depending on a .jsx file to do that.
// That way, i wouldnt need a "unwrapMnemonics" function, 
// the rust function could be more modular, and, i'd be able to use 
// the ErrorBoundary component, as the conversion to Markup elements
// would occur inside rust, and as such, any errors provenient from
// such conversion could be handled appropriately inside rust, and
// and error would be returned to javascript only to show a different
// element, but without ruining the rest of the website because things
// werent handled properly.


// Rust will return an array with all the elements
// it will contain the text, style tag, and the data
// These will then just be set inside and element in 
// the .jsx file.
// No dealing with numbers inside javascript!



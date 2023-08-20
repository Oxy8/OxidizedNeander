import { createSignal } from "solid-js";

const [base, setBase] = createSignal(10);

export {
    base, setBase
}

export function switchBase() {
    switch (base()) {    
        case 16:
            setBase(10);
            break;
        case 10:
            setBase(2);
            break;
        default:
            setBase(16);
            break;
    }
}

export function baseSize() {
    switch (base()) {    
        case 16:
            return(2)
        case 10:
            return(3)
        default:
            return(8)
    }
}


const bases_numericas = {
    2: "Binária",
    10: "Decimal",
    16: "Hexadecimal"
}

export function getBaseName() {
    return (bases_numericas[base()])
}

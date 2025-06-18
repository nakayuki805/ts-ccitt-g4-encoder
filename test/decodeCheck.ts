import { blackTerminatingCodes_64, blackTerminatingCodes_64_1728, eofbCode, makeupCodes, passCode, verticalCode0, verticalCodeL1, verticalCodeL2, verticalCodeL3, verticalCodeR1, verticalCodeR2, verticalCodeR3, whiteTerminatingCodes_64, whiteTerminatingCodes_64_1728 } from "../src/codes";

const eofbStr = eofbCode.map(b=>b.toString()).join('');
const passCodeStr = passCode.map(b=>b.toString()).join('');
const verticalCode0Str = verticalCode0.map(b=>b.toString()).join('');
const verticalCodeR1Str = verticalCodeR1.map(b=>b.toString()).join('');
const verticalCodeR2Str = verticalCodeR2.map(b=>b.toString()).join('');
const verticalCodeR3Str = verticalCodeR3.map(b=>b.toString()).join('');
const verticalCodeL1Str = verticalCodeL1.map(b=>b.toString()).join('');
const verticalCodeL2Str = verticalCodeL2.map(b=>b.toString()).join('');
const verticalCodeL3Str = verticalCodeL3.map(b=>b.toString()).join('');
const whiteTerminatingCodeStrs_64 = whiteTerminatingCodes_64.map(c=>c.map(b=>b.toString()).join(''));
const blackTerminatingCodeStrs_64 = blackTerminatingCodes_64.map(c=>c.map(b=>b.toString()).join(''));
const whiteTerminatingCodeStrs_64_1728 = whiteTerminatingCodes_64_1728.map(c=>[c[0],c[1].map(b=>b.toString()).join('')]) as [number, string][];
const blackTerminatingCodeStrs_64_1728 = blackTerminatingCodes_64_1728.map(c=>[c[0],c[1].map(b=>b.toString()).join('')]) as [number, string][];
const makeupCodeStrs = makeupCodes.map(c=>[c[0],c[1].map(b=>b.toString()).join('')]) as [number, string][];
const horizonalCodeStartStr = "001";

// decode function is used to check encoded data against a target image. Not suitable for practical use and large data sets.
export function decodeTestG4(data: number[],width:number, targetImage?: Uint8Array): boolean {
    const bitsStr = data.map(b => b.toString(2).padStart(8, '0')).join('');
    let codeStrs: string[] = [];
    let pos = 0;
    let eofbFlag = false;
    let currentValue = 0; // 0: white, 1: black
    const decodedLines: string[] = [];
    let prevLine = Array(width).fill(0).join('');
    let currentLine = "";
    let isLineHead = true;
    let targetUnmatched = false;
    while(pos < bitsStr.length) {
        if(currentLine===""){
            codeStrs.push(`<L ${decodedLines.length}>`); // Start a new line
        }
        // console.log("currentLine",currentLine)
        let a0 = currentLine.length;
        let b1 = prevLine.indexOf(currentValue === 0 ? '01' : '10',a0)+1;
        if(isLineHead&&prevLine.startsWith("1")){
            b1=0;
        }else if(b1 < 1) b1=width;
        let b2 = prevLine.indexOf(currentValue === 0 ? '10' : '01',b1)+1;
        if(b2 < 1) b2=width;
        // console.log(`Processing segment: a0=${a0}, b1=${b1}, b2=${b2}, currentValue=${currentValue}`);
        const sliced = bitsStr.slice(pos);
        if(sliced.startsWith(eofbStr)) {
            const codeStr = "EOFB";
            codeStrs.push(codeStr);
            // console.log("Found:", codeStr, "at:", pos);
            pos += eofbStr.length;
            eofbFlag = true;
        }else if(sliced.startsWith(passCodeStr)) {
            const codeStr = "P";
            codeStrs.push(codeStr);
            // console.log("P",b2,a0);
            // console.log("Found:", codeStr, "at:", pos);
            pos += passCodeStr.length;
            currentLine += Array(b2-a0).fill(currentValue === 0 ? '0' : '1').join('');
        }else if(sliced.startsWith(verticalCode0Str)) {
            const codeStr = "V(0)";
            codeStrs.push(codeStr);
            // console.log("V(0)",b1,a0);
            currentLine += Array(b1-a0).fill(currentValue === 0 ? '0' : '1').join('');
            currentValue = currentValue === 0 ? 1 : 0; // Toggle current value
            // console.log("Found:", codeStr, "at:", pos, "Current changed to:", currentValue);
            pos += verticalCode0Str.length;
        }else if(sliced.startsWith(verticalCodeR1Str)) {
            const codeStr = "V(R1)";
            codeStrs.push(codeStr);
            currentLine += Array(b1-a0+1).fill(currentValue === 0 ? '0' : '1').join('');
            currentValue = currentValue === 0 ? 1 : 0; // Toggle current value
            // console.log("Found:", codeStr, "at:", pos, "Current changed to:", currentValue);
            pos += verticalCodeR1Str.length;
        }else if(sliced.startsWith(verticalCodeR2Str)) {
            const codeStr = "V(R2)";
            codeStrs.push(codeStr);
            currentLine += Array(b1-a0+2).fill(currentValue === 0 ? '0' : '1').join('');
            currentValue = currentValue === 0 ? 1 : 0; // Toggle current value
            // console.log("Found:", codeStr, "at:", pos, "Current changed to:", currentValue);
            pos += verticalCodeR2Str.length;
        }else if(sliced.startsWith(verticalCodeR3Str)) {
            const codeStr = "V(R3)";
            codeStrs.push(codeStr);
            // console.log(currentLine)
            // console.log("V(R3)",a0,b1);
            currentLine += Array(b1-a0+3).fill(currentValue === 0 ? '0' : '1').join('');
            currentValue = currentValue === 0 ? 1 : 0; // Toggle current value
            // console.log("Found:", codeStr, "at:", pos, "Current changed to:", currentValue);
            pos += verticalCodeR3Str.length;
        }else if(sliced.startsWith(verticalCodeL1Str)) {
            const codeStr = "V(L1)";
            codeStrs.push(codeStr);
            currentLine += Array(b1-a0-1).fill(currentValue === 0 ? '0' : '1').join('');
            currentValue = currentValue === 0 ? 1 : 0; // Toggle current value
            // console.log("Found:", codeStr, "at:", pos, "Current changed to:", currentValue);
            pos += verticalCodeL1Str.length;
        }else if(sliced.startsWith(verticalCodeL2Str)) {
            const codeStr = "V(L2)";
            codeStrs.push(codeStr);
            // console.log(currentLine)
            // console.log("V(L2)",a0,b1);
            currentLine += Array(b1-a0-2).fill(currentValue === 0 ? '0' : '1').join('');
            currentValue = currentValue === 0 ? 1 : 0; // Toggle current value
            // console.log("Found:", codeStr, "at:", pos, "Current changed to:", currentValue);
            pos += verticalCodeL2Str.length;
        }else if(sliced.startsWith(verticalCodeL3Str)) {
            const codeStr = "V(L3)";
            codeStrs.push(codeStr);
            // console.log("V(L3)",a0,b1);
            currentLine += Array(b1-a0-3).fill(currentValue === 0 ? '0' : '1').join('');
            currentValue = currentValue === 0 ? 1 : 0; // Toggle current value
            // console.log("Found:", codeStr, "at:", pos, "Current changed to:", currentValue);
            pos += verticalCodeL3Str.length;
        }else if(sliced.startsWith(horizonalCodeStartStr)) {
            // Horizontal mode
            let codeStr = "H(";
            pos += horizonalCodeStartStr.length;
            let num1value = currentValue;
            for(let i = 0; i < 2; i++) {
                let sliced = bitsStr.slice(pos);
                let num1 = 0;
                while(true){
                    const makeupCode = makeupCodeStrs.find(c => sliced.startsWith(c[1]));
                    if(!makeupCode) break; // No more makeup codes
                    num1+=makeupCode[0];
                    pos += makeupCode[1].length;
                    sliced = bitsStr.slice(pos);
                }
                if(num1value === 0) {
                    const whiteMakeupCode = whiteTerminatingCodeStrs_64_1728.find(c => sliced.startsWith(c[1]));
                    if(whiteMakeupCode) {
                        // num1value = 0; // white
                        num1 += whiteMakeupCode[0];
                        pos += whiteMakeupCode[1].length;
                        sliced = bitsStr.slice(pos);
                    }
                }else if(num1value === 1){
                    const blackMakeupCode = blackTerminatingCodeStrs_64_1728.find(c => sliced.startsWith(c[1]));
                    if(blackMakeupCode) {
                        // num1value = 1; // black
                        num1 += blackMakeupCode[0];
                        pos += blackMakeupCode[1].length;
                        sliced = bitsStr.slice(pos);
                    }
                }
                if(num1value === 0){
                    const index = whiteTerminatingCodeStrs_64.findIndex(c => sliced.startsWith(c));
                    if(index >= 0) {
                        // num1value = 0; // white
                        num1 += index;
                        pos += whiteTerminatingCodeStrs_64[index].length;
                        sliced = bitsStr.slice(pos);
                    }else{
                        throw ("Error: Could not fount white terminating at position:"+pos);
                    }
                }else if(num1value === 1){
                    const index = blackTerminatingCodeStrs_64.findIndex(c => sliced.startsWith(c));
                    if(index >= 0) {
                        // num1value = 1; // black
                        num1 += index;
                        pos += blackTerminatingCodeStrs_64[index].length;
                        sliced = bitsStr.slice(pos);
                    }else{
                        throw ("Error: Could not fount black terminating at position:"+pos);
                    }
                }
                if(num1value === null) {
                    throw ("Error: Could not determine color for num1 at position:"+pos);
                }else{
                    codeStr += `${i===0?"":","}${num1value === 0 ? "W" : "B"}${num1}`;

                    currentLine += Array(num1).fill(num1value === 0 ? '0' : '1').join('');
                    a0 = currentLine.length; // Update a0 to the end of the current segment
                }
                num1value = num1value === 0 ? 1 : 0; // Toggle value for next segment
            }
            codeStr += ")";
            codeStrs.push(codeStr);
            // console.log("Found:", codeStr, "at:", pos);
        } else if(!eofbFlag){
            throw new Error(`Unknown code at position ${pos}: ${sliced}`);
        }
        // 行の終わりに到達
        // console.log("Current line@end code:", currentLine,currentLine.length,pos,bitsStr.length);
        if(currentLine.length >= width) {
            console.log(`Decoded line(${(decodedLines.length).toString().padStart(3,"0")}):`, currentLine.replaceAll(/0/g, ' ').replaceAll(/1/g, '█').padEnd(width, ' '));
            if(targetImage){
                let targetLineStr = "";
                for(let i = 0; i < width; i++) {
                    const targetBitIndex = decodedLines.length * width + i;
                    targetLineStr += targetImage[Math.floor(targetBitIndex / 8)] & (1 << (7 - (targetBitIndex % 8))) ? '1' : '0';
                }
                console.log("Target line:", targetLineStr);
                if(targetLineStr.startsWith(currentLine)) {
                    console.log("Line matches target image.");
                }else{
                    console.warn("Line does NOT match target image!");
                    targetUnmatched = true;
                }
            }
            decodedLines.push(currentLine);
            prevLine = currentLine;
            currentLine = "";
            currentValue = 0; // Reset current value for the next line
            isLineHead = true; // Reset line head flag
        }else{
            isLineHead = false; // Not a line head
        }
        if(eofbFlag) {
            console.log("End of file reached.");
            break; // EOF reached
        }
    }
    console.log("Codes:", codeStrs.join(', '));
    console.log("Total codes:", codeStrs.length);
    if(targetImage&& targetUnmatched) {
        console.warn("Warning: Some lines did not match the target image.");
        return false;
    } else {
        console.log("All lines matched the target image.");
        return true;
    }
}
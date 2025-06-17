import { eofbCode, passCode, toHorizonalCode, verticalCode0, verticalCodeL1, verticalCodeL2, verticalCodeL3, verticalCodeR1, verticalCodeR2, verticalCodeR3 } from './codes';

// ビットの値が変化した位置を見つける startは開始位置、widthは行の幅、startValueは開始時の値 開始位置の次以降で開始時の値から変化した反対の値の位置を返す(先頭の場合は開始位置以降の最初の変化位置を返す)
function findNextValueChange(buffer: Uint8Array, start: number, width: number, startValue: number): number {
    let prevValue:number|null = start===0?0:null;
    for(let i = start; i < width; i++) {
        const byteIndex = Math.floor(i / 8);
        const byte = buffer[byteIndex];
        if(byte === 0 && prevValue === 0 || byte === 255 && prevValue === 1) {
            i += 7 - (i % 8); // prevValueのままなら次のバイトへスキップ
            continue;
        }else{
            const bit = (byte & (1 << (i % 8))) !== 0 ? 1 : 0;
            if(prevValue !== null && bit !== prevValue && bit !== startValue) {
                return i; // 値が変わった位置を返す
            }
            prevValue = bit; // 現在の値を更新
        }
    }
    return width; // 変更が見つからなかった場合は幅を返す
}
export function encode(imageBuffer: Uint8Array, width: number, height: number): Uint8Array {
    // 初期化
    const referenceBuffer = new Uint8Array(Math.ceil(width / 8));
    let outBuffer = new Uint8Array(Math.ceil(width * height / 8));
    let outBufferLength = 0;
    let addingBits:number[] = [];
    // 8bit単位で出力バッファーに追加
    function addOctetBits(){
        const octets = Math.floor(addingBits.length / 8);
        if(outBufferLength + octets > outBuffer.length) {
            // throw ("Output buffer overflow. Increase the buffer size.");
            const oldBuffer = outBuffer;
            outBuffer = new Uint8Array(Math.ceil((outBufferLength + octets) * 1.5)); // バッファーを拡張
            outBuffer.set(oldBuffer.slice(0, outBufferLength)); // 既存のデータをコピー
            console.warn("Output buffer overflow. Increasing buffer size to", outBuffer.length);
        }
        const bytes:number[] = [];
        for(let i = 0; i < octets; i++) {
            let byte = 0;
            for(let j = 0; j < 8; j++) {
                byte |= (addingBits[i * 8 + j] ? 1 : 0) << (7-j);
            }
            outBuffer[outBufferLength++] = byte;
            bytes.push(byte);
        }
        const remainingBits = addingBits.slice(octets * 8); // 残りのビット
        addingBits = remainingBits; // 残りのビットを保持
    }
    for(let y = 0; y < height; y++) {
        // 現在の行をバッファーにする
        const lineBuffer = new Uint8Array(Math.ceil(width / 8));
        for(let x = 0; x < width; x++) {
            const totalBitIndex = y * width+x;
            const byteIndex = Math.floor(totalBitIndex/8);
            const byte = imageBuffer[byteIndex];
            const bit = (byte & (1 << (7 - totalBitIndex % 8))) !== 0;
            if(bit) {
                lineBuffer[Math.floor(x / 8)] |= (1 << (x % 8));
            }
        }

        // 行のエンコード処理
        let a0 = 0; // 処理開始地点
        let a0value = 0; // a0の値
        while(a0 < width) {
            const a1 = findNextValueChange(lineBuffer, a0, width, a0value);
            const b1 = findNextValueChange(referenceBuffer, a0, width, a0value);
            const b2 = findNextValueChange(referenceBuffer, b1, width, a0value === 0 ? 1 : 0);
            const a0a1 = a1 - a0; // a0からa1までの長さ
            const a1b1 = b1 - a1; // a1からb1までの長さ 0ならV0,正ならa1が左にあるからVL,負ならVR
            if(b2<a1){
                // Pass mode
                addingBits.push(...passCode);
                a0 = b2; // a0を更新
                // a0valueはそのまま
            }else if(-3<= a1b1 && a1b1 <= 3) {
                // Vertical mode
                let code: number[] = [];
                if(a1b1 === 0) code = verticalCode0;
                else if(a1b1 === 1) code = verticalCodeL1;
                else if(a1b1 === 2) code = verticalCodeL2;
                else if(a1b1 === 3) code = verticalCodeL3;
                else if(a1b1 === -1) code = verticalCodeR1;
                else if(a1b1 === -2) code = verticalCodeR2;
                else if(a1b1 === -3) code = verticalCodeR3;
                addingBits.push(...code);
                a0 = a1; // a0を更新
                a0value = a0value === 0 ? 1 : 0; // a0の値を反転
            }else{
                // Horizontal mode
                const a2 = findNextValueChange(lineBuffer, a1, width, a0value === 0 ? 1 : 0);
                const a1a2 = a2 - a1; // a1からa2までの長さ
                const code = toHorizonalCode(a0value, a0a1, a1a2);
                addingBits.push(...code);
                a0 = a2; // a0を更新
                // a0valueはそのまま
            }
            addOctetBits();
        }
        // 最後に参照バッファーに代入
        referenceBuffer.set(lineBuffer, 0);
    }
    // 終了コード
    addingBits.push(...eofbCode);
    // 最後に残ったビットを出力
    addOctetBits();
    if(addingBits.length > 0) {
        let byte = 0;
        for(let j = 0; j < addingBits.length; j++) {
            byte |= (addingBits[j] ? 1 : 0) << (7-j);
        }
        outBuffer[outBufferLength++] = byte;
        addingBits = [];
    }

    const finalBuffer = outBuffer.slice(0, outBufferLength);
    return finalBuffer;
}

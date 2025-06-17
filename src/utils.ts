import { encode } from "./encode";

export function binarizeToBitPacked(
    imageData: ImageData,
    threshold = 128
): Uint8Array {
    const { data, width, height } = imageData;
    const pixelCount = width * height;
    const byteLength = Math.ceil(pixelCount / 8);
    const bitPacked = new Uint8Array(byteLength);

    for (let i = 0; i < pixelCount; i++) {
        const baseIndex = i * 4;
        const r = data[baseIndex];
        const g = data[baseIndex + 1];
        const b = data[baseIndex + 2];
        const a = data[baseIndex + 3];
    
        // アルファを白背景に合成
        const alpha = a / 255;
        const rBlended = r * alpha + 255 * (1 - alpha);
        const gBlended = g * alpha + 255 * (1 - alpha);
        const bBlended = b * alpha + 255 * (1 - alpha);
    
        const luminance = 0.299 * rBlended + 0.587 * gBlended + 0.114 * bBlended;
        const bit = luminance < threshold ? 1 : 0;
    
        const byteIndex = Math.floor(i / 8);
        const bitOffset = 7 - (i % 8); // MSB-first
    
        bitPacked[byteIndex] |= bit << bitOffset;
    }

    return bitPacked;
}
export function imageDataToEncoded(
    imageData: ImageData,
    threshold = 128
): Uint8Array {
    const bitPacked = binarizeToBitPacked(imageData, threshold);
    return encode(bitPacked, imageData.width, imageData.height);
}
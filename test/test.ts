import { encode } from "../src";
import { decodeTestG4 } from "./decodeCheck";
import { testImage } from './testImage';
const height = 150;
const width = 300;

const testImageBuffer = new Uint8Array(testImage); // テスト画像をUint8Arrayに変換
const randomImageBuffer = new Uint8Array(height * width / 8);
crypto.getRandomValues(randomImageBuffer); // ランダムなビット列を生成

const testImageEncoded = encode(testImageBuffer, width, height);
const testImageDecodeResult = decodeTestG4([...testImageEncoded], width, testImageBuffer);
if(!testImageDecodeResult) {
    throw new Error("Test image decoding unmatched");
}
if(testImageEncoded.length !== 392) {
    throw new Error("Test image encoding length mismatch: "+testImageEncoded.length);
}
console.log("Test image encoding and decoding successful");
// const randomImageEncoded = encode(randomImageBuffer, width, height);
// const randomImageDecodeResult = decodeTestG4([...randomImageEncoded], width, randomImageBuffer);
// if(!randomImageDecodeResult) {
//     throw new Error("Random image decoding unmatched");
// }
// console.log("Random image encoding and decoding successful");
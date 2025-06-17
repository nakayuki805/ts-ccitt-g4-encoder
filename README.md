## ts-ccitt-g4-encoder

`ts-ccitt-g4-encoder` は、ピクセルバッファを CCITT G4 Fax 圧縮形式にエンコードするシンプルな TypeScript ライブラリです。

---

### 特徴

* **バイナライズ**
  グレースケール画像を指定した閾値で 2 値化し、ビットパック形式（MSB 先頭）に変換します。
* **CCITT G4 圧縮**
  ビットパック化された 2 値画像を CCITT G4 Fax Compression 形式で効率的に圧縮します。
* **高速かつ高圧縮**
  文章や図面のような一般的な白黒2値画像では PNG エンコードよりも CCITT G4 圧縮の方が処理が高速で、ファイルサイズも小さくなります。
* **Canvas ImageData 対応**
  `CanvasRenderingContext2D#getImageData` で取得した `ImageData` オブジェクトをそのまま受け取れます。

---
<!--
### インストール

```bash
npm install ts-ccitt-g4-encoder
```

---
-->

### 使用例

```typescript
import { binarizeToBitPacked, encode, imageDataToEncoded } from "ts-ccitt-g4-encoder";

// Canvas のコンテキストから ImageData を取得
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas context not available");
const imageData = ctx.getImageData(x, y, width, height);

// 閾値（0-255）を指定してビンナライズ + G4 エンコード
const threshold = 128;

// 方法1: 二段階処理
const bitPacked = binarizeToBitPacked(imageData, threshold);
const encoded = encode(bitPacked, imageData.width, imageData.height);

// 方法2: ワンステップ
const encodedDirect = imageDataToEncoded(imageData, threshold);

console.log(encoded, encodedDirect);
```

---

### API

#### `binarizeToBitPacked(imageData: ImageData, threshold: number): Uint8Array`

* グレースケールを閾値で判定し、2 値化したピクセルを MSB-ファーストのビットパック Uint8Array に変換します。

#### `encode(imageBuffer: Uint8Array, width: number, height: number): Uint8Array`

* ビットパック形式の 2 値画像（MSB-ファースト）を CCITT G4 Fax Compression 形式でエンコードします。

#### `imageDataToEncoded(imageData: ImageData, threshold: number): Uint8Array`

* `binarizeToBitPacked` と `encode` を組み合わせ、`ImageData` から直接 CCITT G4 圧縮データを生成します。

##### ビットパック形式について

MSB-ファーストのビットパック形式では、画像の各ピクセルが左上から右方向に順に格納され、例えば「白白黒白黒白黒黒白」の並びは `0b00101011, 0b0...` のように表現されます。行の途中で次の行へ続く場合も同様にビット単位でシームレスに連結されます。

---

### ライセンス

MIT ライセンスのもとで公開されています。詳しくは `LICENSE` ファイルを参照してください。

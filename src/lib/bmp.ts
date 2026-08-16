// Minimal 24-bit BMP encoder from a canvas (no alpha channel).
export function canvasToBmp(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const bytesPerPixel = 3;
  const rowSize = Math.floor((bytesPerPixel * width + 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BITMAPFILEHEADER
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);

  // BITMAPINFOHEADER
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // top-down
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelArraySize, true);
  view.setUint32(38, 2835, true); // 72 DPI
  view.setUint32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  let offset = 54;
  for (let y = 0; y < height; y++) {
    let rowPos = offset + y * rowSize;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      view.setUint8(rowPos++, data[i + 2]); // B
      view.setUint8(rowPos++, data[i + 1]); // G
      view.setUint8(rowPos++, data[i]); // R
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

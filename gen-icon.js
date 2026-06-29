const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function genIcon(size, outFile) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = await loadImage('iconoweb.jpeg');
  ctx.drawImage(img, 0, 0, size, size);
  fs.writeFileSync(outFile, c.toBuffer('image/png'));
  console.log('Generado:', outFile);
}

(async () => {
  await genIcon(192, 'icon-192.png');
  await genIcon(512, 'icon-512.png');
})();

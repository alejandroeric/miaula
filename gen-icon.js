const { createCanvas } = require('canvas');
const fs = require('fs');

function genIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');

  // Fondo blanco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // M violeta
  ctx.fillStyle = '#7C3AED';
  ctx.font = `900 ${size * 0.38}px Arial`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('M', size * 0.54, size * 0.58);

  // A dorada
  ctx.fillStyle = '#FCD34D';
  ctx.font = `900 ${size * 0.26}px Arial`;
  ctx.textAlign = 'left';
  ctx.fillText('A', size * 0.55, size * 0.58);

  // Línea dorada
  ctx.fillStyle = '#FCD34D';
  ctx.fillRect(size * 0.10, size * 0.63, size * 0.80, size * 0.03);

  // MI AULA
  ctx.fillStyle = '#1E1B4B';
  ctx.font = `900 ${size * 0.09}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MI AULA', size * 0.5, size * 0.80);

  return c.toBuffer('image/png');
}

fs.writeFileSync('icon-192.png', genIcon(192));
fs.writeFileSync('icon-512.png', genIcon(512));
console.log('OK');

const { createCanvas } = require('canvas');
const fs = require('fs');

function genIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Fondo violeta oscuro liso
  ctx.fillStyle = '#1E1B4B';
  ctx.fillRect(0, 0, size, size);

  // Círculo violeta central grande
  ctx.fillStyle = '#7C3AED';
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.05, size * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // M blanca
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${size * 0.35}px Arial`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', cx - size * 0.01, cy - size * 0.05);

  // A amarilla
  ctx.fillStyle = '#FCD34D';
  ctx.font = `900 ${size * 0.25}px Arial`;
  ctx.textAlign = 'left';
  ctx.fillText('A', cx + size * 0.02, cy - size * 0.05);

  // MI AULA abajo
  ctx.fillStyle = '#C4B5FD';
  ctx.font = `900 ${size * 0.1}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MI AULA', cx, cy + size * 0.38);

  return c.toBuffer('image/png');
}

fs.writeFileSync('icon-192.png', genIcon(192));
fs.writeFileSync('icon-512.png', genIcon(512));
console.log('OK');

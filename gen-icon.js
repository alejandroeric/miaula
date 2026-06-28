const { createCanvas } = require('canvas');
const fs = require('fs');

function genIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const cx = size / 2;

  // Fondo lila muy suave
  ctx.fillStyle = '#FDF4FF';
  ctx.fillRect(0, 0, size, size);

  // Pill violeta centrado
  const pillW = size * 0.70;
  const pillH = size * 0.42;
  const pillX = cx - pillW / 2;
  const pillY = size * 0.20;
  const r = pillH * 0.28;

  ctx.fillStyle = '#7C3AED';
  ctx.beginPath();
  ctx.moveTo(pillX + r, pillY);
  ctx.lineTo(pillX + pillW - r, pillY);
  ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
  ctx.lineTo(pillX + pillW, pillY + pillH - r);
  ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
  ctx.lineTo(pillX + r, pillY + pillH);
  ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
  ctx.lineTo(pillX, pillY + r);
  ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
  ctx.closePath();
  ctx.fill();

  // M blanca dentro del pill
  ctx.fillStyle = 'white';
  ctx.font = `900 ${size * 0.30}px Arial`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', cx - size * 0.02, pillY + pillH / 2);

  // A dorada dentro del pill
  ctx.fillStyle = '#FCD34D';
  ctx.font = `900 ${size * 0.21}px Arial`;
  ctx.textAlign = 'left';
  ctx.fillText('A', cx, pillY + pillH / 2);

  // MI AULA abajo
  ctx.fillStyle = '#7C3AED';
  ctx.font = `900 ${size * 0.09}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MI AULA', cx, size * 0.80);

  return c.toBuffer('image/png');
}

fs.writeFileSync('icon-192.png', genIcon(192));
fs.writeFileSync('icon-512.png', genIcon(512));
console.log('OK');

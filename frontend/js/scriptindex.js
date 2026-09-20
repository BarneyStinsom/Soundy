  const svg = document.getElementById('ondas');
const NS = 'http://www.w3.org/2000/svg';
const seg = 400;   
const amp = 70;    

for (let i = 0; i < 34; i++) {
  const y = 260 + i * 20;
  let d = `M -400 ${y}`;
  for (let x = -400; x < 2000; x += seg) {
    d += ` C ${x + seg * 0.25} ${y - amp}, ${x + seg * 0.75} ${y + amp}, ${x + seg} ${y}`;
  }
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('class', 'onda');
  p.style.animationDuration = (9 + i * 0.4) + 's';
  p.style.animationDelay = (-i * 0.6) + 's';
  p.style.opacity = 0.12 + (i % 12) * 0.045;
  svg.appendChild(p);
}
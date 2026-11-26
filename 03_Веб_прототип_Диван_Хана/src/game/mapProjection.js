// Проекция экранной точки (clientX/clientY) в координаты стратегической карты 700×460.
// Учитывает текущий viewBox (зум/панораму) И CSS 3D-наклон стола (perspective + rotateX),
// иначе при наклонённом столе клики у верхнего края промахивались на десятки пикселей.

const MAP_W = 700;
const MAP_H = 460;

// Обратная 2D-гомография: решаем, какая точка плоскости (z=0) элемента проецируется в экранную точку
function unprojectThroughTransform(el, clientX, clientY) {
  const style = window.getComputedStyle(el);
  if (!style.transform || style.transform === 'none' || typeof DOMMatrix === 'undefined') return null;

  // Нетрансформированное положение элемента: родитель трансформа не имеет
  const parent = el.offsetParent;
  if (!parent) return null;
  const pRect = parent.getBoundingClientRect();
  const left = pRect.left + parent.clientLeft + el.offsetLeft;
  const top = pRect.top + parent.clientTop + el.offsetTop;

  const [ox, oy] = style.transformOrigin.split(' ').map((v) => parseFloat(v) || 0);
  const m = new DOMMatrix()
    .translate(left + ox, top + oy)
    .multiply(new DOMMatrix(style.transform))
    .translate(-ox, -oy);

  // Гомография для точек (x, y, 0, 1): X = (m11 x + m21 y + m41) / W, Y = (...)/W, W = m14 x + m24 y + m44
  const a = m.m11, b = m.m21, c = m.m41;
  const d = m.m12, e = m.m22, f = m.m42;
  const g = m.m14, h = m.m24, i = m.m44;
  // Решаем линейную систему относительно x, y
  const A1 = a - g * clientX, B1 = b - h * clientX, C1 = clientX * i - c;
  const A2 = d - g * clientY, B2 = e - h * clientY, C2 = clientY * i - f;
  const det = A1 * B2 - A2 * B1;
  if (Math.abs(det) < 1e-9) return null;
  return { x: (C1 * B2 - C2 * B1) / det, y: (A1 * C2 - A2 * C1) / det };
}

function findTransformedAncestor(el) {
  let node = el.parentElement;
  for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
    const tf = window.getComputedStyle(node).transform;
    if (tf && tf !== 'none') return node;
  }
  return null;
}

export function clientToMapPoint(svgEl, clientX, clientY) {
  const vbParts = (svgEl.getAttribute('viewBox') || `0 0 ${MAP_W} ${MAP_H}`).trim().split(/\s+/).map(Number);
  const [vbX, vbY, vbW, vbH] =
    vbParts.length === 4 && vbParts.every((n) => !Number.isNaN(n)) ? vbParts : [0, 0, MAP_W, MAP_H];

  let fx;
  let fy;
  const tilted = findTransformedAncestor(svgEl);
  const local = tilted ? unprojectThroughTransform(tilted, clientX, clientY) : null;
  if (local && svgEl.clientWidth && svgEl.clientHeight) {
    // svg — первый ребёнок наклонённой рамки, смещён на ширину её рамки (border)
    const sx = local.x - tilted.clientLeft;
    const sy = local.y - tilted.clientTop;
    fx = sx / svgEl.clientWidth;
    fy = sy / svgEl.clientHeight;
  } else {
    const rect = svgEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    fx = (clientX - rect.left) / rect.width;
    fy = (clientY - rect.top) / rect.height;
  }

  return {
    x: Math.max(0, Math.min(MAP_W, vbX + fx * vbW)),
    y: Math.max(0, Math.min(MAP_H, vbY + fy * vbH)),
    viewBox: { x: vbX, y: vbY, w: vbW, h: vbH }
  };
}

if (typeof window !== 'undefined') {
  window.__imamatClientToMapPoint = clientToMapPoint;
}


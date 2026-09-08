const HEX = /^#?([0-9a-fA-F]{6})$/;

export function parseHex(hex) {
  const m = HEX.exec(String(hex).trim());
  if (!m) throw new Error(`Некорректный hex: ${hex}`);
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function toHex({ r, g, b }) {
  const c = (v) => Math.round(Math.min(255, Math.max(0, v)))
    .toString(16).padStart(2, '0').toUpperCase();
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mix(hexA, hexB, amount) {
  if (amount < 0 || amount > 1) throw new Error(`mix: amount вне 0..1: ${amount}`);
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  return toHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

export function relativeLuminance(hex) {
  const { r, g, b } = parseHex(hex);
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrastRatio(hexA, hexB) {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

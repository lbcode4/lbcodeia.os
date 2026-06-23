export type CorMarca = { hex: string; label: string };

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const cVal = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = cVal * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - cVal / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [cVal, x, 0];
  else if (h < 120) [r, g, b] = [x, cVal, 0];
  else if (h < 180) [r, g, b] = [0, cVal, x];
  else if (h < 240) [r, g, b] = [0, x, cVal];
  else if (h < 300) [r, g, b] = [x, 0, cVal];
  else [r, g, b] = [cVal, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function sugerirCoresRelacionadas(paleta: CorMarca[]): string[] {
  const existentes = new Set(paleta.map((c) => c.hex.toUpperCase()));
  const candidatas: string[] = [];
  for (const cor of paleta) {
    const [h, s, l] = hexToHsl(cor.hex);
    candidatas.push(hslToHex((h + 180) % 360, s, l));
    candidatas.push(hslToHex((h + 30) % 360, s, l));
    candidatas.push(hslToHex(h, s, Math.min(100, l + 20)));
  }
  return [...new Set(candidatas)].filter((hex) => !existentes.has(hex)).slice(0, 6);
}

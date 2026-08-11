export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name?: string;
}

export type PaletteType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "monochromatic";

// ── Conversions ──────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = parseInt(full, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      case bn:
        h = ((rn - gn) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;

  return {
    r: Math.round(hueToRgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hn) * 255),
    b: Math.round(hueToRgb(p, q, hn - 1 / 3) * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mod360(h: number): number {
  return ((h % 360) + 360) % 360;
}

function makeColor(h: number, s: number, l: number): ColorInfo {
  const hue = mod360(h);
  const hex = hslToHex(hue, s, l);
  const rgb = hexToRgb(hex);
  return { hex, rgb, hsl: { h: hue, s, l } };
}

// ── Color naming ──────────────────────────────────────────────────────────────

export function getColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (s < 10) {
    if (l > 85) return 'White';
    if (l < 15) return 'Black';
    if (l > 60) return 'Light Gray';
    if (l < 35) return 'Dark Gray';
    return 'Gray';
  }
  const lightness = l > 80 ? 'Light ' : l > 60 ? 'Soft ' : l < 25 ? 'Dark ' : l < 40 ? 'Deep ' : '';
  let hue = '';
  if (h < 15 || h >= 345) hue = 'Red';
  else if (h < 35) hue = 'Orange';
  else if (h < 55) hue = 'Yellow';
  else if (h < 80) hue = 'Lime';
  else if (h < 150) hue = 'Green';
  else if (h < 175) hue = 'Teal';
  else if (h < 200) hue = 'Cyan';
  else if (h < 235) hue = 'Blue';
  else if (h < 270) hue = 'Indigo';
  else if (h < 300) hue = 'Purple';
  else if (h < 330) hue = 'Pink';
  else hue = 'Rose';
  return `${lightness}${hue}`.trim();
}

// ── Palette generation ────────────────────────────────────────────────────────

export function generatePalette(
  baseHex: string,
  type: PaletteType
): ColorInfo[] {
  const rgb = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  switch (type) {
    case "complementary":
      return [
        makeColor(h, s, l),
        makeColor(h + 180, s, l),
        makeColor(h + 150, s, l),
        makeColor(h + 210, s, l),
        makeColor(h + 30, s, l),
      ];

    case "analogous":
      return [
        makeColor(h - 60, s, l),
        makeColor(h - 30, s, l),
        makeColor(h, s, l),
        makeColor(h + 30, s, l),
        makeColor(h + 60, s, l),
      ];

    case "triadic":
      return [
        makeColor(h, s, l),
        makeColor(h + 120, s, l),
        makeColor(h + 240, s, l),
        makeColor(h + 60, s, l),
        makeColor(h + 180, s, l),
      ];

    case "tetradic":
      return [
        makeColor(h, s, l),
        makeColor(h + 90, s, l),
        makeColor(h + 180, s, l),
        makeColor(h + 270, s, l),
      ];

    case "monochromatic": {
      const saturation = s < 5 ? 60 : s;
      return [
        makeColor(h, saturation, 20),
        makeColor(h, saturation, 35),
        makeColor(h, saturation, 50),
        makeColor(h, saturation, 65),
        makeColor(h, saturation, 80),
      ];
    }
  }
}

"use client";

import { useState, useRef, useEffect } from "react";
import {
  generatePalette,
  hslToHex,
  hexToRgb,
  PaletteType,
} from "@/lib/colors";
import ColorSwatch from "@/components/ColorSwatch";
import PaletteTypeSelector from "@/components/PaletteTypeSelector";

const DEFAULT_COLOR = "#6366f1";

interface SavedPalette {
  id: string;
  base: string;
  type: PaletteType;
  colors: string[];
}

function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 50) + 40; // 40–90%
  const l = Math.floor(Math.random() * 30) + 35; // 35–65%
  return hslToHex(h, s, l);
}

function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function getTextColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = 0.299 * (r / 255) + 0.587 * (g / 255) + 0.114 * (b / 255);
  return luminance > 0.4 ? "#1a1a1a" : "#f5f5f5";
}

export default function Home() {
  const [baseColor, setBaseColor] = useState(DEFAULT_COLOR);
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR);
  const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [lockedBgColor, setLockedBgColor] = useState<string | null>(null);
  const [showCopyPanel, setShowCopyPanel] = useState(false);
  const [copyTab, setCopyTab] = useState<"css" | "hex" | "tailwind">("css");
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const hexInputRef = useRef<HTMLInputElement>(null);

  const palette = generatePalette(baseColor, paletteType);
  const activeBg = hoveredColor ?? lockedBgColor ?? "#fafaf8";
  const heroTextColor = getTextColor(activeBg);
  const heroSubColor =
    heroTextColor === "#1a1a1a" ? "#555" : "rgba(245,245,245,0.8)";

  // Load saved palettes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("focus-palette-saved");
      if (stored) {
        setSavedPalettes(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist saved palettes to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("focus-palette-saved", JSON.stringify(savedPalettes));
    } catch {
      // ignore
    }
  }, [savedPalettes]);

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBaseColor(val);
    setHexInput(val);
    setLockedBgColor(null);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
  };

  const applyHexInput = () => {
    const val = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
    if (isValidHex(val)) {
      setBaseColor(val);
      setHexInput(val);
      setLockedBgColor(null);
    } else {
      setHexInput(baseColor);
    }
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyHexInput();
      hexInputRef.current?.blur();
    }
  };

  const handleRandomize = () => {
    const hex = randomHex();
    setBaseColor(hex);
    setHexInput(hex);
    setLockedBgColor(null);
  };

  const handleSavePalette = () => {
    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      base: baseColor,
      type: paletteType,
      colors: palette.map((c) => c.hex),
    };
    setSavedPalettes((prev) => [newPalette, ...prev]);
  };

  const handleDeleteSaved = (id: string) => {
    setSavedPalettes((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoadSaved = (saved: SavedPalette) => {
    setBaseColor(saved.base);
    setHexInput(saved.base);
    setPaletteType(saved.type);
  };

  // Copy as Code formats
  const cssCode = `:root {\n${palette
    .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
    .join("\n")}\n}`;
  const hexCode = palette.map((c) => c.hex).join("\n");
  const tailwindCode = `colors: {\n  palette: {\n${palette
    .map((c, i) => `    ${i + 1}: '${c.hex}',`)
    .join("\n")}\n  }\n}`;

  const codeByTab = { css: cssCode, hex: hexCode, tailwind: tailwindCode };
  const currentCode = codeByTab[copyTab];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      // ignore
    }
  };

  // Fallback to last color if palette has fewer than 5 entries (tetradic = 4)
  const accentColor = palette[4]?.hex ?? palette[palette.length - 1].hex;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: activeBg,
        transition: "background-color 0.4s ease",
      }}
    >
      {/* Navbar */}
      <nav className="border-b border-black/10 bg-white/70 backdrop-blur-sm h-14 flex items-center px-6">
        <span className="font-heading text-xl text-[#1a1a1a]">
          Color Palette Generator
        </span>
      </nav>

      {/* Hero / Input Section */}
      <section className="max-w-3xl mx-auto py-10 px-6 text-center">
        <h1
          className="font-heading text-4xl font-normal leading-tight"
          style={{ color: heroTextColor, transition: "color 0.3s ease" }}
        >
          Generate Beautiful Color Palettes
        </h1>
        <p
          className="mt-3 text-lg"
          style={{ color: heroSubColor, transition: "color 0.3s ease" }}
        >
          Pick a color, choose a scheme.
        </p>

        {/* Color input row */}
        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
          {/* Color picker */}
          <input
            type="color"
            value={baseColor}
            onChange={handleColorPickerChange}
            className="w-[52px] h-[52px] rounded-xl cursor-pointer"
            style={{ padding: 0 }}
          />

          {/* Hex text input */}
          <input
            ref={hexInputRef}
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={applyHexInput}
            onKeyDown={handleHexKeyDown}
            placeholder="#6366f1"
            maxLength={7}
            className="bg-white border border-black/15 rounded-xl px-4 py-3 w-36 text-[#1a1a1a] font-mono text-sm focus:outline-none focus:border-[#6366f1]"
          />

          {/* Randomize button */}
          <button
            onClick={handleRandomize}
            className="bg-white border border-black/15 rounded-xl px-5 py-3 text-[#1a1a1a] font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Randomize
          </button>
        </div>

        {/* Palette type selector */}
        <div className="mt-6 overflow-x-auto">
          <div className="w-fit mx-auto px-6">
            <PaletteTypeSelector
              selected={paletteType}
              onChange={setPaletteType}
            />
          </div>
        </div>

        {/* Action buttons row */}
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => setShowCopyPanel((v) => !v)}
            className="bg-white border border-black/15 rounded-xl px-4 py-2 text-[#1a1a1a] font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            {showCopyPanel ? "Hide Code" : "Copy as Code"}
          </button>
          <button
            onClick={handleSavePalette}
            className="bg-white border border-black/15 rounded-xl px-4 py-2 text-[#1a1a1a] font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Save Palette
          </button>
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="bg-white border border-black/15 rounded-xl px-4 py-2 text-[#1a1a1a] font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            {showPreview ? "Hide Preview" : "Preview UI"}
          </button>
        </div>

        {/* Copy as Code Panel */}
        {showCopyPanel && (
          <div className="mt-4 bg-white/90 border border-black/10 rounded-2xl p-4 text-left">
            <div className="flex gap-2 mb-3 flex-wrap">
              {(["css", "hex", "tailwind"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCopyTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                    copyTab === tab
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#555] hover:text-[#1a1a1a]"
                  }`}
                >
                  {tab === "css"
                    ? "CSS Variables"
                    : tab === "hex"
                    ? "Hex List"
                    : "Tailwind"}
                </button>
              ))}
            </div>
            <pre className="bg-[#1a1a1a] text-[#f5f5f5] rounded-xl p-4 font-mono text-sm overflow-x-auto whitespace-pre">
              {currentCode}
            </pre>
            <button
              onClick={handleCopyCode}
              className="mt-3 bg-[#1a1a1a] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#333] transition-colors"
            >
              {copiedCode ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </section>

      {/* Palette grid */}
      <section className="mt-2 pb-8 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {palette.map((color, i) => (
            <ColorSwatch
              key={`${color.hex}-${i}`}
              color={color}
              isBase={i === 0}
              onHover={() => setHoveredColor(color.hex)}
              onHoverEnd={() => setHoveredColor(null)}
              onSelect={() => setLockedBgColor(color.hex)}
            />
          ))}
        </div>
      </section>

      {/* Mock UI Preview */}
      {showPreview && (
        <section className="max-w-5xl mx-auto px-6 pb-8">
          <div className="bg-white/90 border border-black/10 rounded-2xl p-6">
            <h2
              className="font-heading text-2xl"
              style={{ color: palette[0].hex }}
            >
              Design Preview
            </h2>
            <p
              className="mt-1 text-lg font-medium"
              style={{ color: palette[1].hex }}
            >
              See your palette in action
            </p>
            <p className="mt-2 text-sm text-[#555]">
              This preview shows how your palette looks applied to real UI
              elements. Use it to evaluate contrast, harmony, and visual weight
              before committing to your color choices.
            </p>
            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                className="rounded-full px-5 py-2 text-white text-sm font-semibold"
                style={{ backgroundColor: palette[0].hex }}
              >
                Primary Action
              </button>
              <button
                className="rounded-full px-5 py-2 bg-transparent text-sm font-semibold border-2"
                style={{
                  borderColor: palette[0].hex,
                  color: palette[0].hex,
                }}
              >
                Secondary
              </button>
            </div>
            <div
              className="mt-4 rounded-xl p-4"
              style={{ backgroundColor: accentColor }}
            >
              <p className="text-sm font-medium" style={{ color: getTextColor(accentColor) }}>Accent Card</p>
              <p className="text-xs mt-1" style={{ color: getTextColor(accentColor), opacity: 0.7 }}>
                This card uses your lightest palette color as a background.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Saved Palettes */}
      {savedPalettes.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2
            className="font-heading text-2xl mb-4"
            style={{ color: heroTextColor, transition: 'color 0.3s ease' }}
          >
            Saved Palettes
          </h2>
          <div className="flex flex-col gap-3">
            {savedPalettes.map((saved) => (
              <div
                key={saved.id}
                className="group bg-white/90 border border-black/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => handleLoadSaved(saved)}
              >
                <div className="flex gap-2">
                  {saved.colors.map((hex, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#555] capitalize font-medium flex-1">
                  {saved.type}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSaved(saved.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#888] hover:text-[#1a1a1a] text-xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

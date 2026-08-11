"use client";

import { useState } from "react";
import { ColorInfo, getColorName } from "@/lib/colors";

interface ColorSwatchProps {
  color: ColorInfo;
  isBase?: boolean;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onSelect?: () => void;
}

export default function ColorSwatch({
  color,
  isBase,
  onHover,
  onHoverEnd,
  onSelect,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: select text
    }
    onSelect?.();
  };

  const { r, g, b } = color.rgb;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      className="bg-white/90 border border-black/10 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 select-none"
    >
      {/* Color block */}
      <div
        className="w-full h-32 relative overflow-hidden rounded-t-2xl"
        style={{ backgroundColor: color.hex }}
      >
        {isBase && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            BASE
          </span>
        )}
        {copied && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm font-bold">
            Copied!
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <p className="font-mono font-bold text-sm text-[#1a1a1a]">
          {color.hex.toUpperCase()}
        </p>
        <p className="text-xs text-[#888] mt-0.5">
          rgb({r}, {g}, {b})
        </p>
        <p className="text-xs font-medium text-[#555] mt-0.5">
          {getColorName(color.hex)}
        </p>
      </div>
    </div>
  );
}

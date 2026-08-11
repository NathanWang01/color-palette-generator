"use client";

import { PaletteType } from "@/lib/colors";

interface PaletteTypeSelectorProps {
  selected: PaletteType;
  onChange: (t: PaletteType) => void;
}

const TABS: { label: string; value: PaletteType }[] = [
  { label: "Complementary", value: "complementary" },
  { label: "Analogous", value: "analogous" },
  { label: "Triadic", value: "triadic" },
  { label: "Tetradic", value: "tetradic" },
  { label: "Monochromatic", value: "monochromatic" },
];

export default function PaletteTypeSelector({
  selected,
  onChange,
}: PaletteTypeSelectorProps) {
  return (
    <div className="inline-flex gap-1 bg-gray-100 rounded-full p-1">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            rounded-full px-5 py-2 text-sm transition-all duration-150
            ${
              selected === tab.value
                ? "bg-[#1a1a1a] text-white font-semibold"
                : "text-[#555] hover:text-[#1a1a1a] font-medium"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

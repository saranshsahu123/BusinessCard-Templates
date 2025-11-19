import { useState } from "react";
import { FontSelector } from "./FontSelector";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Type, Palette, Minus, Plus } from "lucide-react";

interface CustomizationPanelProps {
  selectedFont: string;
  onFontSelect: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
}

const colorPresets = [
  "#000000", "#ffffff", "#374151", "#6b7280", "#9ca3af",
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#f59e0b", "#ef4444", "#10b981", "#059669", "#84cc16",
  // additional 13 colors
  "#8B4513", // saddle brown
  "#D2691E", // chocolate
  "#FF7F50", // coral
  "#FF6347", // tomato
  "#FFA07A", // light salmon
  "#FFD700", // gold
  "#C0C0C0", // silver
  "#708090", // slate gray
  "#00CED1", // dark turquoise
  "#40E0D0", // turquoise
  "#7B68EE", // medium slate blue
  "#BA55D3", // medium orchid
  "#FF1493"  // deep pink
];

const colorLabels: Record<string, string> = {
  "#000000": "Black",
  "#ffffff": "White",
  "#374151": "Slate",
  "#6b7280": "Gray",
  "#9ca3af": "Light Gray",
  "#0ea5e9": "Sky Blue",
  "#3b82f6": "Blue",
  "#6366f1": "Indigo",
  "#8b5cf6": "Purple",
  "#ec4899": "Pink",
  "#f59e0b": "Amber",
  "#ef4444": "Red",
  "#10b981": "Green",
  "#059669": "Emerald",
  "#84cc16": "Lime",
  "#8B4513": "Saddle Brown",
  "#D2691E": "Chocolate",
  "#FF7F50": "Coral",
  "#FF6347": "Tomato",
  "#FFA07A": "Light Salmon",
  "#FFD700": "Gold",
  "#C0C0C0": "Silver",
  "#708090": "Slate Gray",
  "#00CED1": "Dark Turquoise",
  "#40E0D0": "Turquoise",
  "#7B68EE": "Medium Slate Blue",
  "#BA55D3": "Medium Orchid",
  "#FF1493": "Deep Pink",
};

export const CustomizationPanel = ({
  selectedFont,
  onFontSelect,
  fontSize,
  onFontSizeChange,
  textColor,
  onTextColorChange,
  accentColor,
  onAccentColorChange
}: CustomizationPanelProps) => {
  const [activeTab, setActiveTab] = useState<"font" | "size" | "text" | "accent">("font");

  const tabBase = "flex-1 px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer text-center";

  return (
    <div className="space-y-2">
      {/* Nav-style tab bar */}
      <div className="flex items-center gap-1 rounded-full bg-muted/60 px-1 py-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("font")}
          className={
            tabBase +
            (activeTab === "font"
              ? " bg-primary text-primary-foreground shadow-sm"
              : " text-foreground/70 hover:bg-muted")
          }
        >
          Font
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("size")}
          className={
            tabBase +
            (activeTab === "size"
              ? " bg-primary text-primary-foreground shadow-sm"
              : " text-foreground/70 hover:bg-muted")
          }
        >
          Size
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={
            tabBase +
            (activeTab === "text"
              ? " bg-primary text-primary-foreground shadow-sm"
              : " text-foreground/70 hover:bg-muted")
          }
        >
          Text Color
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("accent")}
          className={
            tabBase +
            (activeTab === "accent"
              ? " bg-primary text-primary-foreground shadow-sm"
              : " text-foreground/70 hover:bg-muted")
          }
        >
          Accent Color
        </button>
      </div>

      {/* Active tab content */}
      <div className="rounded-lg border border-border/70 bg-background/60 px-3 py-2">
        {activeTab === "font" && (
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium whitespace-nowrap">Font</Label>
            <div className="flex-1 min-w-[140px]">
              <FontSelector
                selectedFont={selectedFont}
                onFontSelect={onFontSelect}
              />
            </div>
          </div>
        )}

        {activeTab === "size" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-xs font-medium whitespace-nowrap">Font Size</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
                  disabled={fontSize <= 12}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xs font-mono w-10 text-center">{fontSize}px</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
                  disabled={fontSize >= 24}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => onFontSizeChange(value[0])}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {activeTab === "text" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium whitespace-nowrap">Text Color</Label>
              <span
                className="inline-block w-5 h-5 rounded border border-gray-300"
                style={{ backgroundColor: textColor }}
              />
              <select
                className="flex-1 rounded border border-gray-300 bg-background px-2 py-1 text-xs min-w-[140px]"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
              >
                {colorPresets.map((color) => (
                  <option key={color} value={color}>
                    {colorLabels[color] ?? color}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-mono">{textColor}</span>
            </div>
          </div>
        )}

        {activeTab === "accent" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium whitespace-nowrap">Accent Color</Label>
              <span
                className="inline-block w-5 h-5 rounded border border-gray-300"
                style={{ backgroundColor: accentColor }}
              />
              <select
                className="flex-1 rounded border border-gray-300 bg-background px-2 py-1 text-xs min-w-[140px]"
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
              >
                {colorPresets.map((color) => (
                  <option key={color} value={color}>
                    {colorLabels[color] ?? color}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-mono">{accentColor}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
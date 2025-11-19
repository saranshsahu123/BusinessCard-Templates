

// 🔹 Improved: safer property access + better visual diversity
import React from "react";
import { BusinessCardData } from "../BusinessCardForm";

export const DynamicCard = ({
  data,
  designConfig = {},
}: {
  data: BusinessCardData;
  designConfig: any;
}) => {
  // 🧠 Destructure safely with defaults
  const {
    bgStyle = "gradient",
    bgColors = ["#ffffff", "#f0f0f0"],
    textColor = "#000000",
    accentColor = "#0ea5e9",
    fontFamily = "Inter, Arial, sans-serif",
    layout = "centered",
    logoShape = "circle",
  } = designConfig;
  const hasUserName = !!data.name?.trim();

  const bgStyleObj =
    bgStyle === "gradient" && bgColors.length >= 2
      ? { background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1]})` }
      : { backgroundColor: bgColors[0] };

  // 🆕 subtle overlay for depth
  const overlay =
    bgStyle === "gradient"
      ? "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_60%)] after:pointer-events-none"
      : "";

  return (
    <div
      className={`relative w-full aspect-[1.75/1] rounded-xl overflow-hidden shadow-lg flex items-center justify-between p-6 ${overlay}`}
      style={{
        ...bgStyleObj,
        color: textColor,
        fontFamily,
      }}
    >
      {data.logo && (
        <div className="flex-shrink-0">
          <img
            src={data.logo}
            alt="Logo"
            className={`object-cover ${
              logoShape === "circle" ? "rounded-full" : "rounded-md"
            } w-20 h-20 border-2 border-white/40 shadow`}
          />
        </div>
      )}

      <div className="flex flex-col text-right ml-4">
        <h3 className="text-xl font-bold">
          {hasUserName ? (data.name || "") : (data.name || "Your Name")}
        </h3>
        {data.title?.trim() && (
          <p style={{ color: accentColor }}>{data.title}</p>
        )}
        {data.company?.trim() && (
          <p className="text-sm opacity-80">{data.company}</p>
        )}
      </div>
    </div>
  );
};

import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ClassicDesignConfig } from "@/lib/classicTemplates";

interface Props {
  data: {
    name?: string;
    title?: string;
    company?: string;
    logo?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
  config?: ClassicDesignConfig;
  background?: { style: "solid" | "gradient"; colors: string[] };
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: number;

  showLargeQR?: boolean;
  transparentBg?: boolean;
  compact?: boolean;
  qrSize?: number;
  qrColor?: string;
  qrLogoUrl?: string;
  qrStyle?: "classic" | "soft" | "contrast" | "outline" | "pill";
}

const getContrast = (hex: string) => {
  try {
    const v = hex.replace("#", "");
    const fullHex = v.length === 3 ? v.split("").map(c => c + c).join("") : v;
    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#0f172a" : "#ffffff";
  } catch {
    return "#0f172a";
  }
};

export const BackSideCard: React.FC<Props> = ({
  data,
  config,
  background,
  textColor,
  accentColor,
  fontFamily,
  fontSize = 15,
  showLargeQR = true,
  transparentBg = false,
  compact = false,
  qrSize,
  qrColor = "#000000",
  qrLogoUrl,
  qrStyle = "classic",
}) => {
  const appliedAccent = accentColor ?? config?.accentColor ?? "#1f2937";

  const hasAnyContact =
    !!(data.email || data.phone || data.website || data.address);

  /**
   * RESPONSIVE FONT SCALE
   * Auto-adjust based on screen width
   */
  const responsiveFont = useMemo(() => {
    if (typeof window === "undefined") return fontSize;
    const w = window.innerWidth;

    if (w <= 360) return fontSize * 0.82; // very small phones
    if (w <= 400) return fontSize * 0.9;  // Pixel 7a + Redmi 10s
    return fontSize;
  }, [fontSize]);

  // Background
  const bgStyle: React.CSSProperties = useMemo(() => {
    if (transparentBg) return {};

    const style = config?.bgStyle ?? background?.style ?? "solid";
    const colors = config?.bgColors ?? background?.colors ?? ["#ffffff"];

    if (style === "gradient" && colors.length >= 2) {
      return { background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` };
    }
    return { backgroundColor: colors[0] };
  }, [transparentBg, config, background]);

  const baseBgColor = (config?.bgColors ?? background?.colors ?? ["#ffffff"])[0];
  const appliedText = textColor ?? config?.textColor ?? getContrast(baseBgColor);

  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${data.name || ""}
TITLE:${data.title || ""}
ORG:${data.company || ""}
EMAIL:${data.email || ""}
TEL:${data.phone || ""}
URL:${data.website || ""}
ADR:${data.address || ""}
END:VCARD`;

  const qrValue =
    data.website && data.website.trim().length > 0
      ? data.website.trim()
      : vCardData;

  const qrImageSettings = useMemo(() => {
    if (!qrLogoUrl) return undefined;
    return {
      src: qrLogoUrl,
      height: 26,
      width: 26,
      excavate: true,
    };
  }, [qrLogoUrl]);

  /**
   * Responsive QR size
   */
  const responsiveQRSize = useMemo(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 430;

    if (qrSize) return qrSize;
    if (w <= 360) return 80;
    if (w <= 400) return 90;
    return showLargeQR ? 110 : 70;
  }, [qrSize, showLargeQR]);

  // QR Wrapper Style
  const qrWrapperClass =
    qrStyle === "soft"
      ? "bg-white/90 shadow-md rounded-2xl border border-white/70"
      : qrStyle === "contrast"
      ? "bg-slate-900 shadow-lg rounded-xl border-2 border-white"
      : qrStyle === "outline"
      ? "bg-transparent shadow-none rounded-xl border-2 border-white/90"
      : qrStyle === "pill"
      ? "bg-white/90 shadow-sm rounded-full border border-white/80 px-6 py-3"
      : "bg-white/90 shadow-sm rounded-xl p-2";

  return (
    <div
      className="
        w-full h-full 
        flex flex-col items-center justify-center 
        p-4 
        relative rounded-xl
        overflow-hidden
      "
      style={{
        ...bgStyle,
        color: appliedText,
        fontFamily: fontFamily ?? config?.fontFamily ?? "Inter, Arial, sans-serif",
        fontSize: responsiveFont,
      }}
    >
      {/* Background pattern */}
      {!transparentBg && !compact && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="topo" width="100" height="100" patternUnits="userSpaceOnUse">
                <path
                  d="M0,50 C25,0 75,0 100,50 C75,100 25,100 0,50Z"
                  fill="none"
                  stroke={appliedAccent}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo)" />
          </svg>
        </div>
      )}

      {/* CONTACT + QR */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center gap-3">

        {/* Contact Section */}
        <div className="text-center leading-tight space-y-1 w-full">
          {hasAnyContact ? (
            <>
              {data.email && (
                <div><strong style={{ color: appliedAccent }}>✉</strong> {data.email}</div>
              )}
              {data.phone && (
                <div><strong style={{ color: appliedAccent }}>✆</strong> {data.phone}</div>
              )}
              {data.website && (
                <div><strong style={{ color: appliedAccent }}>⌂</strong> {data.website}</div>
              )}
              {data.address && (
                <div><strong style={{ color: appliedAccent }}>📍</strong> {data.address}</div>
              )}
            </>
          ) : (
            <>
              <div><strong style={{ color: appliedAccent }}>✉</strong> email@example.com</div>
              <div><strong style={{ color: appliedAccent }}>✆</strong> +91 00000 00000</div>
              <div><strong style={{ color: appliedAccent }}>⌂</strong> your-website.com</div>
              <div><strong style={{ color: appliedAccent }}>📍</strong> Your Address</div>
            </>
          )}
        </div>

        {/* QR Code */}
        <div className={qrWrapperClass}>
          <QRCodeSVG
            value={qrValue}
            size={responsiveQRSize}
            fgColor={qrColor}
            imageSettings={qrImageSettings}
          />
        </div>
      </div>
    </div>
  );
};

export default BackSideCard;

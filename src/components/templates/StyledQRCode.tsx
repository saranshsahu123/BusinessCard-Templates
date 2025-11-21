import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

export type QRVisualStyle = "classic" | "dots" | "rounded" | "pattern";

interface StyledQRCodeProps {
  value: string;
  size: number;
  fgColor?: string;
  bgColor?: string;
  logoUrl?: string;
  style?: QRVisualStyle;
}



export const StyledQRCode: React.FC<StyledQRCodeProps> = ({
  value,
  size,
  fgColor = "#000000",
  bgColor = "transparent",
  logoUrl,
  style = "classic",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const dotsType =
      style === "dots"
        ? "dots"
        : style === "rounded"
        ? "rounded"
        : style === "pattern"
        ? "extra-rounded"
        : "square";

    const backgroundOptions = {
      color: bgColor,
      // Explicit default to avoid library reading from undefined
      hideBackgroundDots: false,
    } as any;

    const imageOptions = logoUrl
      ? {
          crossOrigin: "anonymous" as const,
          margin: 4,
        }
      : undefined;

    try {
      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling({
          width: size,
          height: size,
          type: "svg",
          data: value,
          dotsOptions: {
            type: dotsType as any,
            color: fgColor,
          },
          backgroundOptions,
          image: logoUrl,
          imageOptions,
        } as any);

        if (containerRef.current && qrRef.current) {
          qrRef.current.append(containerRef.current);
        }
      } else {
        qrRef.current.update({
          width: size,
          height: size,
          data: value,
          dotsOptions: {
            type: dotsType as any,
            color: fgColor,
          },
          backgroundOptions,
          image: logoUrl,
          imageOptions,
        } as any);
      }
    } catch (err) {
      console.error("Failed to render styled QR code", err);
    }
  }, [value, size, fgColor, bgColor, logoUrl, style]);

  return <div ref={containerRef} />;
};

import { QRCodeSVG } from "qrcode.react";
import { BusinessCardData } from "../BusinessCardForm";

interface BoldCardProps {
  data: BusinessCardData;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  accentColor?: string;
}

export const BoldCard = ({ data, fontFamily = "Arial, sans-serif", fontSize, textColor = "#000000", accentColor = "#0ea5e9" }: BoldCardProps) => {
  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
TITLE:${data.title}
ORG:${data.company}
EMAIL:${data.email}
TEL:${data.phone}
URL:${data.website}
ADR:${data.address}
END:VCARD`;
  const hasUserCoreInfo = !!(data.name && data.email && data.phone);
  const hasUserName = !!data.name?.trim();

  return (
    <div
      className="w-full aspect-[1.75/1] bg-white rounded-lg overflow-hidden shadow-lg"
      style={{ fontFamily, fontSize: fontSize ? `${fontSize}px` : '16px' }}
    >
      <div className="h-1/3 bg-gradient-to-r from-primary to-accent p-6 flex items-center">
        <div>
          <h3 className="text-2l font-bold text-white mb-1">
            {hasUserName ? (data.name || "") : (data.name || "Your Name")}
          </h3>
          {data.title?.trim() && (
            <p className="text-sm text-white/90">{data.title}</p>
          )}
        </div>
      </div>

      <div className="h-2/3 p-6 flex flex-col justify-between">
        <div>
          {data.company?.trim() && (
            <p className="text-lg font-semibold mb-4" style={{ color: accentColor }}>
              {data.company}
            </p>
          )}
          <div className="space-y-1.5 text-sm" style={{ color: textColor }}>
            {data.email && <div className="font-medium">{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.website && <div style={{ color: accentColor }}>{data.website}</div>}
          </div>
        </div>

        {data.name && data.email && (
          <div className="flex justify-end">
            <div className="border-2 rounded p-1.5" style={{ borderColor: accentColor }}>
              <QRCodeSVG value={vCardData} size={50} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

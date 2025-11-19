import { QRCodeSVG } from "qrcode.react";
import { BusinessCardData } from "../BusinessCardForm";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

interface MinimalCardProps {
  data: BusinessCardData;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  accentColor?: string;
}

export const MinimalCard = ({ data, fontFamily = "Arial, sans-serif", fontSize, textColor = "#000000", accentColor = "#0ea5e9" }: MinimalCardProps) => {
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
      className="w-full aspect-[1.75/1] bg-white rounded-lg p-8 flex flex-col justify-between relative overflow-hidden shadow-lg"
      style={{ fontFamily, fontSize: fontSize ? `${fontSize}px` : '16px', color: textColor }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-full"></div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
          {hasUserName ? (data.name || "") : (data.name || "Your Name")}
        </h3>
        {data.title?.trim() && (
          <p className="text-sm font-medium mb-1" style={{ color: accentColor }}>
            {data.title}
          </p>
        )}
        {data.company?.trim() && (
          <p className="text-xs opacity-80" style={{ color: textColor }}>
            {data.company}
          </p>
        )}
      </div>

      <div className="flex justify-between items-end relative z-10">
        <div className="space-y-1 text-xs opacity-80" style={{ color: textColor }}>
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" style={{ color: accentColor }} />
              <span>{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" style={{ color: accentColor }} />
              <span>{data.phone}</span>
            </div>
          )}
          {data.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" style={{ color: accentColor }} />
              <span>{data.website}</span>
            </div>
          )}
        </div>

        {data.name && data.email && (
          <div className="bg-white p-2 rounded-lg shadow-md">
            <QRCodeSVG value={vCardData} size={60} />
          </div>
        )}
      </div>
    </div>
  );
};

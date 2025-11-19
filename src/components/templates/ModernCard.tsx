import { QRCodeSVG } from "qrcode.react";
import { BusinessCardData } from "../BusinessCardForm";
import { Mail, Phone, Globe } from "lucide-react";

interface ModernCardProps {
  data: BusinessCardData;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  accentColor?: string;
}

export const ModernCard = ({ data, fontFamily = "Arial, sans-serif", fontSize, textColor = "#ffffff", accentColor = "#0ea5e9" }: ModernCardProps) => {
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
      className="w-full aspect-[1.75/1] bg-gradient-to-br from-primary to-accent rounded-lg p-8 flex flex-col justify-between relative overflow-hidden shadow-lg"
      style={{ fontFamily, fontSize: fontSize ? `${fontSize}px` : '16px' }}
    >
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]"></div>

      <div className="relative z-10">
        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 mb-4">
          {data.company?.trim() && (
            <p className="text-xs font-medium" style={{ color: textColor }}>
              {data.company}
            </p>
          )}
        </div>
        <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
          {hasUserName ? (data.name || "") : (data.name || "Your Name")}
        </h3>
        {data.title?.trim() && (
          <p className="text-sm opacity-90" style={{ color: textColor }}>
            {data.title}
          </p>
        )}
      </div>

      <div className="flex justify-between items-end relative z-10">
        <div className="space-y-1.5 text-xs opacity-95" style={{ color: textColor }}>
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
          <div className="bg-white p-2 rounded-lg">
            <QRCodeSVG value={vCardData} size={60} />
          </div>
        )}
      </div>
    </div>
  );
};

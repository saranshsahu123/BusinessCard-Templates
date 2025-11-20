import { useState, useEffect, useRef } from "react";
import { BusinessCardData } from "./BusinessCardForm";
import { DynamicCard } from "./templates/DynamicCard";
import { BackSideCard } from "./templates/BackSideCard";
import { Button } from "./ui/button";
import { Loader2, Sparkles, Check, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateDesigns } from "@/services/designService";
import { downloadAsImage } from "@/lib/utils";

interface TemplateCardProps {
  design: any;
  index: number;
  selectedDesignId?: string;
  onSelectTemplate: (designConfig: any) => void;
  data: BusinessCardData;
}

const TemplateCard = ({
  design,
  index,
  selectedDesignId,
  onSelectTemplate,
  data,
}: TemplateCardProps): JSX.Element => {
  const [showBack, setShowBack] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Safety: fallback to design if .front missing
  const front = design.front || design;
  const isPremium = false;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardRef.current) {
      downloadAsImage(cardRef.current, `business-card-${design.id}.png`);
    }
  };

  return (
    <div
      className="relative group cursor-pointer border rounded-xl shadow hover:shadow-xl transition bg-background"
      onClick={() => onSelectTemplate(design)}
    >
      {/* Card Preview (Front or Back) */}
      <div ref={cardRef} className="aspect-[1.75/1] overflow-hidden rounded-lg relative">
        {showBack ? (
          <BackSideCard
            data={data}
            background={{
              style: front?.bgStyle || "gradient",
              colors: front?.bgColors || ["#ffffff", "#f0f0f0"],
            }}
            textColor={front?.textColor}
            accentColor={front?.accentColor}
            fontFamily={front?.fontFamily}
            qrColor={front?.textColor || "#000000"}
          />
        ) : (
          <DynamicCard data={data} designConfig={front} />
        )}
      </div>

      {/* Flip Button */}
      <div className="absolute top-2 left-2 z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setShowBack((prev) => !prev);
          }}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Selected Checkmark + Download */}
      {selectedDesignId === design.id && (
        <>
          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 z-10">
            <Check className="w-4 h-4" />
          </div>
          <div className="absolute top-2 right-12 z-10">
            <Button size="sm" onClick={handleDownload} variant="secondary">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {/* Hover Overlay with Price */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg z-10">
        <div className="text-center text-white">
          <p className="text-lg font-semibold mb-1">Free</p>
          <p className="text-xs">Basic Design</p>
        </div>
      </div>
    </div>
  );
};

interface AITemplateGalleryProps {
  data: BusinessCardData;
  onSelectTemplate: (designConfig: any) => void;
  selectedDesignId?: string;
}

export const AITemplateGallery = ({
  data,
  onSelectTemplate,
  selectedDesignId,
}: AITemplateGalleryProps) => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [showBackSelected, setShowBackSelected] = useState(false);
  const selectedPreviewRef = useRef<HTMLDivElement>(null);

  const requestDesigns = async (count: number = 100) => {
    setIsLoading(true);
    try {
      const result = await generateDesigns(count, data);

      if (!Array.isArray(result)) {
        throw new Error("Invalid response format from AI service");
      }

      const processedDesigns = result.map((d: any, i: number) => ({
        id: d.id || `design-${i}`,
        name: d.name || `Design ${i + 1}`,
        front: d.front || d,
        back: d.back || {
          showEmail: true,
          showPhone: true,
          showWebsite: true,
          showAddress: true,
          includeQRCode: true,
        },
        // Copy style props to front for backward compatibility
        ...(d.front
          ? {}
          : {
            bgStyle: d.bgStyle || "gradient",
            bgColors: Array.isArray(d.bgColors) ? d.bgColors : ["#ffffff", "#f0f0f0"],
            textColor: d.textColor || "#000000",
            accentColor: d.accentColor || "#0ea5e9",
            layout: d.layout || "centered",
            decoration: d.decoration || "none",
            fontWeight: d.fontWeight || "normal",
            fontFamily: d.fontFamily || "Arial",
            borderStyle: d.borderStyle || "none",
          }),
      }));

      setDesigns(processedDesigns);

      toast({
        title: "AI Templates Ready!",
        description: `${processedDesigns.length} unique designs generated.`,
      });
    } catch (error: any) {
      console.error("Error generating designs:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Could not generate designs.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestDesigns(50);
  }, []);

  const selectedDesign = designs.find((d) => d.id === selectedDesignId);
  const frontConfig = selectedDesign?.front || selectedDesign;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI-Generated Templates
        </h2>
        <Button
          onClick={() => requestDesigns(100)}
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>

      {/* Selected Design Large Preview */}
      {selectedDesign && (
        <div className="bg-card rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Selected Design Preview</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBackSelected((prev) => !prev)}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {showBackSelected ? "Front" : "Back"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  selectedPreviewRef.current &&
                  downloadAsImage(selectedPreviewRef.current, `${selectedDesign.name || selectedDesign.id}.png`)
                }
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/50 to-background p-6 rounded-lg">
            <div className="max-w-md mx-auto relative" ref={selectedPreviewRef}>
              {showBackSelected ? (
                <BackSideCard
                  data={data}
                  background={{
                    style: frontConfig?.bgStyle || "gradient",
                    colors: frontConfig?.bgColors || ["#ffffff", "#f0f0f0"],
                  }}
                  textColor={frontConfig?.textColor}
                  accentColor={frontConfig?.accentColor}
                  fontFamily={frontConfig?.fontFamily}
                  showLargeQR={true}
                />
              ) : (
                <DynamicCard data={data} designConfig={frontConfig} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && designs.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[1.75/1] bg-muted rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      ) : (
        /* Template Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {designs.map((design, index) => (
            <TemplateCard
              key={design.id}
              design={design}
              index={index}
              selectedDesignId={selectedDesignId}
              onSelectTemplate={onSelectTemplate}
              data={data}
            />
          ))}
        </div>
      )}
    </div>
  );
};
import { useEffect, useState, useRef } from "react";
import { BusinessCardData } from "./BusinessCardForm";
import { ClassicCard } from "./templates/ClassicCard";
import { Check, Download } from "lucide-react";
import { downloadAsImage } from "@/lib/utils";
import { Button } from "./ui/button";
import { classicTemplates } from "@/lib/classicTemplates";
import { BackSideCard } from "./templates/BackSideCard";
import { QRCodeSVG } from "qrcode.react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { listPublishedTemplates, Template } from "@/services/templates";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}


interface TemplateSelectorProps {
  data: BusinessCardData;
  selectedFont?: string;
  fontSize?: number;
  textColor?: string;
  accentColor?: string;
}

const templates = classicTemplates;

export const TemplateSelector = ({
  data,
  selectedFont = "Arial, sans-serif",
  fontSize = 16,
  textColor = "#000000",
  accentColor = "#0ea5e9"
}: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? "classic-001");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const selectedConfig = templates.find((t) => t.id === selectedTemplate) || templates[0];
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [sbTemplates, setSbTemplates] = useState<Template[]>([]);
  const combined = [
    // Show admin/server templates first like before
    ...sbTemplates.map((t) => ({ kind: "server" as const, id: `sb:${t.id}`, server: t })),
    ...templates.map((t) => ({ kind: "classic" as const, id: t.id, classic: t })),
  ];
  const totalPages = Math.max(1, Math.ceil(combined.length / pageSize));
  const pagedTemplates = combined.slice(page * pageSize, page * pageSize + pageSize);
  const cartCtx = useCart();
  const navigate = useNavigate();
  const pricePerItem = 2.99;
  const { user } = useAuth();          // ⬅️ yeh line add karo
  const [isEditLayout, setIsEditLayout] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  const isCustomerDetailsValid = () => {
    const effectiveName = (customerName || data.name || "").trim();
    const effectivePhone = (customerPhone || data.phone || "").trim();
    return (
      !!effectiveName &&
      !!effectivePhone &&
      !!addressLine1.trim() &&
      !!city.trim() &&
      !!state.trim() &&
      !!pincode.trim()
    );
  };

  type FrontKey = 'name' | 'title' | 'company' | 'logo';

  const [positions, setPositions] = useState<{
    name: { x: number; y: number };
    title: { x: number; y: number };
    company: { x: number; y: number };
    logo: { x: number; y: number };
  }>(
    {
      name: { x: 70, y: 30 },
      title: { x: 70, y: 42 },
      company: { x: 70, y: 52 },
      logo: { x: 18, y: 50 },
    }
  );
  const [sizes, setSizes] = useState<{
    name: number;
    title: number;
    company: number;
    logo: number;
  }>({ name: 22, title: 18, company: 14, logo: 64 });
  const dragState = useRef<{ key: FrontKey | null; offsetX: number; offsetY: number }>({ key: null, offsetX: 0, offsetY: 0 });
  const resizeState = useRef<{ key: FrontKey | null; baseSize: number; startY: number }>({ key: null, baseSize: 0, startY: 0 });

  const [positionsBack, setPositionsBack] = useState<{ email: { x: number; y: number }; phone: { x: number; y: number }; website: { x: number; y: number }; address: { x: number; y: number }; qr: { x: number; y: number } }>(
    { email: { x: 15, y: 20 }, phone: { x: 15, y: 32 }, website: { x: 15, y: 44 }, address: { x: 15, y: 56 }, qr: { x: 75, y: 35 } }
  );
  const [backSizes, setBackSizes] = useState<{ email: number; phone: number; website: number; address: number; qr: number }>({ email: 15, phone: 15, website: 15, address: 15, qr: 72 });
  const backDragState = useRef<{ key: 'email' | 'phone' | 'website' | 'address' | 'qr' | null; offsetX: number; offsetY: number }>({ key: null, offsetX: 0, offsetY: 0 });
  const backResizeState = useRef<{ key: 'email' | 'phone' | 'website' | 'address' | 'qr' | null; baseSize: number; startY: number }>({ key: null, baseSize: 0, startY: 0 });

  const onDragStart = (key: FrontKey, e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditLayout || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const pointX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pointY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragState.current = { key, offsetX: pointX - rect.left, offsetY: pointY - rect.top };
    window.addEventListener('mousemove', onDragMove as any);
    window.addEventListener('touchmove', onDragMove as any, { passive: false });
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
  };

  const onDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isEditLayout || !previewRef.current || !dragState.current.key) return;
    const rect = previewRef.current.getBoundingClientRect();
    const pointX = e instanceof TouchEvent ? e.touches[0]?.clientX ?? dragState.current.offsetX : (e as MouseEvent).clientX;
    const pointY = e instanceof TouchEvent ? e.touches[0]?.clientY ?? dragState.current.offsetY : (e as MouseEvent).clientY;
    const xPx = Math.min(Math.max(pointX - rect.left, 0), rect.width);
    const yPx = Math.min(Math.max(pointY - rect.top, 0), rect.height);
    const x = (xPx / rect.width) * 100;
    const y = (yPx / rect.height) * 100;
    const k = dragState.current.key;
    setPositions((p) => ({ ...p, [k]: { x, y } }));
    if (e instanceof TouchEvent) e.preventDefault();
  };

  const onDragEnd = () => {
    dragState.current = { key: null, offsetX: 0, offsetY: 0 };
    window.removeEventListener('mousemove', onDragMove as any);
    window.removeEventListener('touchmove', onDragMove as any);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchend', onDragEnd);
  };

  const onResizeStart = (key: FrontKey, e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditLayout) return;
    const startY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const baseSize = sizes[key];
    resizeState.current = { key, baseSize, startY };
    window.addEventListener('mousemove', onResizeMove as any);
    window.addEventListener('touchmove', onResizeMove as any, { passive: false });
    window.addEventListener('mouseup', onResizeEnd);
    window.addEventListener('touchend', onResizeEnd);
  };

  const onResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isEditLayout || !resizeState.current.key) return;
    const curY = e instanceof TouchEvent ? e.touches[0]?.clientY ?? resizeState.current.startY : (e as MouseEvent).clientY;
    const delta = curY - resizeState.current.startY;
    const k = resizeState.current.key;
    const newSize = Math.max(8, Math.min(64, Math.round(resizeState.current.baseSize + delta * 0.2)));
    setSizes((s) => ({ ...s, [k]: newSize }));
    if (e instanceof TouchEvent) e.preventDefault();
  };

  const onResizeEnd = () => {
    resizeState.current = { key: null, baseSize: 0, startY: 0 };
    window.removeEventListener('mousemove', onResizeMove as any);
    window.removeEventListener('touchmove', onResizeMove as any);
    window.removeEventListener('mouseup', onResizeEnd);
    window.removeEventListener('touchend', onResizeEnd);
  };

  const onBackDragStart = (key: 'email' | 'phone' | 'website' | 'address' | 'qr', e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditLayout || !backRef.current) return;
    const rect = backRef.current.getBoundingClientRect();
    const pointX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pointY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    backDragState.current = { key, offsetX: pointX - rect.left, offsetY: pointY - rect.top };
    window.addEventListener('mousemove', onBackDragMove as any);
    window.addEventListener('touchmove', onBackDragMove as any, { passive: false });
    window.addEventListener('mouseup', onBackDragEnd);
    window.addEventListener('touchend', onBackDragEnd);
  };

  const onBackDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isEditLayout || !backRef.current || !backDragState.current.key) return;
    const rect = backRef.current.getBoundingClientRect();
    const pointX = e instanceof TouchEvent ? e.touches[0]?.clientX ?? backDragState.current.offsetX : (e as MouseEvent).clientX;
    const pointY = e instanceof TouchEvent ? e.touches[0]?.clientY ?? backDragState.current.offsetY : (e as MouseEvent).clientY;
    const xPx = Math.min(Math.max(pointX - rect.left, 0), rect.width);
    const yPx = Math.min(Math.max(pointY - rect.top, 0), rect.height);
    const x = (xPx / rect.width) * 100;
    const y = (yPx / rect.height) * 100;
    const k = backDragState.current.key;
    setPositionsBack((p) => ({ ...p, [k!]: { x, y } }));
    if (e instanceof TouchEvent) e.preventDefault();
  };

  const onBackDragEnd = () => {
    backDragState.current = { key: null, offsetX: 0, offsetY: 0 };
    window.removeEventListener('mousemove', onBackDragMove as any);
    window.removeEventListener('touchmove', onBackDragMove as any);
    window.removeEventListener('mouseup', onBackDragEnd);
    window.removeEventListener('touchend', onBackDragEnd);
  };

  const onBackResizeStart = (key: 'email' | 'phone' | 'website' | 'address' | 'qr', e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditLayout) return;
    const startY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const baseSize = backSizes[key];
    backResizeState.current = { key, baseSize, startY };
    window.addEventListener('mousemove', onBackResizeMove as any);
    window.addEventListener('touchmove', onBackResizeMove as any, { passive: false });
    window.addEventListener('mouseup', onBackResizeEnd);
    window.addEventListener('touchend', onBackResizeEnd);
  };

  const onBackResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isEditLayout || !backResizeState.current.key) return;
    const curY = e instanceof TouchEvent ? e.touches[0]?.clientY ?? backResizeState.current.startY : (e as MouseEvent).clientY;
    const delta = curY - backResizeState.current.startY;
    const k = backResizeState.current.key;
    const clampMax = k === 'qr' ? 140 : 64;
    const clampMin = k === 'qr' ? 40 : 8;
    const newSize = Math.max(clampMin, Math.min(clampMax, Math.round(backResizeState.current.baseSize + delta * 0.2)));
    setBackSizes((s) => ({ ...s, [k]: newSize }));
    if (e instanceof TouchEvent) e.preventDefault();
  };

  const onBackResizeEnd = () => {
    backResizeState.current = { key: null, baseSize: 0, startY: 0 };
    window.removeEventListener('mousemove', onBackResizeMove as any);
    window.removeEventListener('touchmove', onBackResizeMove as any);
    window.removeEventListener('mouseup', onBackResizeEnd);
    window.removeEventListener('touchend', onBackResizeEnd);
  };

  const defaultFont = "Arial, sans-serif";
  const defaultFontSize = 16;
  const defaultText = "#000000";
  const defaultAccent = "#0ea5e9";
  const hasOverrides =
    selectedFont !== defaultFont ||
    fontSize !== defaultFontSize ||
    textColor !== defaultText ||
    accentColor !== defaultAccent;

  // fetch admin/server templates
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listPublishedTemplates();
        if (alive) setSbTemplates(Array.isArray(data) ? data : []);
      } catch { }
    })();
    return () => { alive = false; };
  }, []);

  // When server templates load, make sure we show page 1 where they appear first
  useEffect(() => {
    setPage(0);
  }, [Array.isArray(sbTemplates) ? sbTemplates.length : 0]);

  // Default select the first server template when available (previous behavior)
  useEffect(() => {
    const list = Array.isArray(sbTemplates) ? sbTemplates : [];
    if (list.length > 0 && !String(selectedTemplate).startsWith("sb:")) {
      setSelectedTemplate(`sb:${list[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(sbTemplates) ? sbTemplates.length : 0]);

  const addToCart = () => {
    const isServer = selectedTemplate.startsWith("sb:");
    const serverId = isServer ? selectedTemplate.slice(3) : "";
    const st = isServer ? sbTemplates.find(x => x.id === serverId) : undefined;
    cartCtx.add({
      id: selectedTemplate,
      kind: isServer ? "server" : "classic",
      data,
      selectedFont,
      fontSize,
      textColor,
      accentColor,
      price: pricePerItem,
      serverMeta: isServer ? { name: st?.name, background_url: st?.background_url, back_background_url: st?.back_background_url, config: st?.config } : undefined,
    });
    navigate("/cart");
  };

  const buyCurrent = () => {
    try {
      // Agar koi template hi select nahi, to ignore
      if (!selectedTemplate) return;

      // Server/client template info
      const isServer = selectedTemplate.startsWith("sb:");
      const serverId = isServer ? selectedTemplate.slice(3) : "";
      const st = isServer ? sbTemplates.find((x) => x.id === serverId) : undefined;

      // Current template ko cart me add karo (agar pehle se nahi hai)
      cartCtx.add({
        id: selectedTemplate,
        kind: isServer ? "server" : "classic",
        data,
        selectedFont,
        fontSize,
        textColor,
        accentColor,
        price: pricePerItem,
        serverMeta: isServer ? { name: st?.name, background_url: st?.background_url, back_background_url: st?.back_background_url, config: st?.config } : undefined,
      });

      // Ab alag page pe customer details + payment ke liye bhejo
      navigate("/checkout");
    } catch (e: any) {
      alert(e.message || "Unable to start checkout");
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border animate-fade-in [animation-delay:0.1s] opacity-0 [animation-fill-mode:forwards]">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Selected Design Preview</h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isEditLayout} onChange={(e) => setIsEditLayout(e.target.checked)} />
                Edit layout
              </label>
              <Button onClick={buyCurrent} size="sm" className="gap-2">Buy</Button>
              <Button onClick={addToCart} variant="outline" size="sm" className="gap-2">Add to Cart</Button>
            </div>
          </div>

          {false && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 border rounded-lg p-3 bg-background/40">
                <h3 className="text-sm font-semibold">Customer Details</h3>
                <div className="grid gap-2 text-xs">
                  <div className="grid gap-1">
                    <label className="font-medium">Full Name *</label>
                    <input
                      className="border rounded px-2 py-1"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={data.name || "Your Name"}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="font-medium">Phone *</label>
                    <input
                      className="border rounded px-2 py-1"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={data.phone || "Phone number"}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="font-medium">Address Line 1 *</label>
                    <input
                      className="border rounded px-2 py-1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="House / Flat, Street"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="font-medium">Address Line 2</label>
                    <input
                      className="border rounded px-2 py-1"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Area, Landmark (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="grid gap-1">
                      <label className="font-medium">City *</label>
                      <input
                        className="border rounded px-2 py-1"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="font-medium">State *</label>
                      <input
                        className="border rounded px-2 py-1"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="font-medium">Pincode *</label>
                      <input
                        className="border rounded px-2 py-1"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-br from-muted to-background p-4 sm:p-6 md:p-8 rounded-lg overflow-x-hidden">
          <div className="bg-gradient-to-br from-muted to-background rounded-lg overflow-hidden p-4 sm:p-6">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const isServer = selectedTemplate.startsWith("sb:");
                if (!isServer) {
                  return (
                    <>
                      <div ref={previewRef} className="relative w-full max-w-full overflow-hidden">
                        <div className="wm-screen-only" data-watermark="screen-only" />
                        {!isEditLayout && selectedConfig && (
                          <ClassicCard
                            data={data}
                            config={selectedConfig}
                            fontFamily={hasOverrides ? selectedFont : undefined}
                            fontSize={hasOverrides ? fontSize : undefined}
                            textColor={hasOverrides ? textColor : undefined}
                            accentColor={hasOverrides ? accentColor : undefined}
                          />
                        )}
                        {isEditLayout && selectedConfig && (
                          <div
                            className="w-full aspect-[1.75/1] rounded-lg border overflow-hidden p-4 relative"
                            style={{
                              background: selectedConfig.bgStyle === 'gradient' ? `linear-gradient(135deg, ${selectedConfig.bgColors[0]}, ${selectedConfig.bgColors[1]})` : undefined,
                              backgroundColor: selectedConfig.bgStyle === 'solid' ? selectedConfig.bgColors[0] : undefined,
                              color: hasOverrides ? (textColor ?? selectedConfig.textColor) : selectedConfig.textColor,
                              fontFamily: hasOverrides ? selectedFont : undefined,
                              fontSize: `${hasOverrides ? fontSize : 16}px`,
                            }}
                          >
                            <div className="absolute inset-0">
                              <div
                                className="cursor-move select-none font-bold"
                                style={{ position: 'absolute', left: `${positions.name.x}%`, top: `${positions.name.y}%`, fontSize: sizes.name }}
                                onMouseDown={(e) => onDragStart('name', e)}
                                onTouchStart={(e) => onDragStart('name', e)}
                              >
                                {data.name || 'Your Name'}
                                <span
                                  className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                  style={{ right: -6, bottom: -6 }}
                                  onMouseDown={(e) => { e.stopPropagation(); onResizeStart('name', e); }}
                                  onTouchStart={(e) => { e.stopPropagation(); onResizeStart('name', e); }}
                                />
                              </div>
                              <div
                                className="cursor-move select-none"
                                style={{ position: 'absolute', left: `${positions.title.x}%`, top: `${positions.title.y}%`, color: hasOverrides ? (accentColor ?? selectedConfig.accentColor) : selectedConfig.accentColor, fontSize: sizes.title }}
                                onMouseDown={(e) => onDragStart('title', e)}
                                onTouchStart={(e) => onDragStart('title', e)}
                              >
                                {data.title || 'Job Title'}
                                <span
                                  className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                  style={{ right: -6, bottom: -6 }}
                                  onMouseDown={(e) => { e.stopPropagation(); onResizeStart('title', e); }}
                                  onTouchStart={(e) => { e.stopPropagation(); onResizeStart('title', e); }}
                                />
                              </div>
                              <div
                                className="cursor-move select-none opacity-80"
                                style={{ position: 'absolute', left: `${positions.company.x}%`, top: `${positions.company.y}%`, fontSize: sizes.company }}
                                onMouseDown={(e) => onDragStart('company', e)}
                                onTouchStart={(e) => onDragStart('company', e)}
                              >
                                {data.company || 'Company'}
                                <span
                                  className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                  style={{ right: -6, bottom: -6 }}
                                  onMouseDown={(e) => { e.stopPropagation(); onResizeStart('company', e); }}
                                  onTouchStart={(e) => { e.stopPropagation(); onResizeStart('company', e); }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div ref={backRef} className="relative w-full max-w-full overflow-hidden">
                        <div className="wm-screen-only" data-watermark="screen-only" />
                        {!isEditLayout && selectedConfig && (
                          <BackSideCard
                            data={data}
                            background={{
                              style: selectedConfig.bgStyle === "solid" ? "solid" : "gradient",
                              colors: selectedConfig.bgColors,
                            }}
                            textColor={hasOverrides ? (textColor ?? selectedConfig.textColor) : selectedConfig.textColor}
                            accentColor={hasOverrides ? (accentColor ?? selectedConfig.accentColor) : selectedConfig.accentColor}
                            fontFamily={hasOverrides ? selectedFont : undefined}
                            fontSize={hasOverrides ? fontSize : undefined}
                          />
                        )}
                        {isEditLayout && selectedConfig && (
                          <div
                            className="w-full aspect-[1.75/1] rounded-lg border overflow-hidden relative"
                            style={{
                              background: selectedConfig.bgStyle === 'gradient' ? `linear-gradient(135deg, ${selectedConfig.bgColors[0]}, ${selectedConfig.bgColors[1]})` : undefined,
                              backgroundColor: selectedConfig.bgStyle === 'solid' ? selectedConfig.bgColors[0] : undefined,
                              color: hasOverrides ? (textColor ?? selectedConfig.textColor) : selectedConfig.textColor,
                              fontFamily: hasOverrides ? selectedFont : undefined,
                              fontSize: `${hasOverrides ? fontSize : 16}px`,
                            }}
                          >
                            <div className="absolute inset-0">
                              <div
                                className="cursor-move select-none"
                                style={{ position: 'absolute', left: `${positionsBack.email.x}%`, top: `${positionsBack.email.y}%`, fontSize: backSizes.email }}
                                onMouseDown={(e) => onBackDragStart('email', e)}
                                onTouchStart={(e) => onBackDragStart('email', e)}
                              >
                                <strong style={{ color: hasOverrides ? (accentColor ?? selectedConfig.accentColor) : selectedConfig.accentColor }}>✉</strong> {data.email || 'email@example.com'}
                                <span
                                  className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                  style={{ right: -6, bottom: -6 }}
                                  onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('email', e); }}
                                  onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('email', e); }}
                                />
                              </div>
                              <div
                                className="cursor-move select-none"
                                style={{ position: 'absolute', left: `${positionsBack.phone.x}%`, top: `${positionsBack.phone.y}%`, fontSize: backSizes.phone }}
                                onMouseDown={(e) => onBackDragStart('phone', e)}
                                onTouchStart={(e) => onBackDragStart('phone', e)}
                              >
                                <strong style={{ color: hasOverrides ? (accentColor ?? selectedConfig.accentColor) : selectedConfig.accentColor }}>✆</strong> {data.phone || '+91 00000 00000'}
                                <span
                                  className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                  style={{ right: -6, bottom: -6 }}
                                  onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('phone', e); }}
                                  onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('phone', e); }}
                                />
                              </div>
                              <div
                                className="cursor-move select-none"
                                style={{ position: 'absolute', left: `${positionsBack.website.x}%`, top: `${positionsBack.website.y}%`, fontSize: backSizes.website }}
                                onMouseDown={(e) => onBackDragStart('website', e)}
                                onTouchStart={(e) => onBackDragStart('website', e)}
                              >
                                <strong style={{ color: hasOverrides ? (accentColor ?? selectedConfig.accentColor) : selectedConfig.accentColor }}>⌂</strong> {data.website || 'your-website.com'}
                                <span
                                  className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                  style={{ right: -6, bottom: -6 }}
                                  onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('website', e); }}
                                  onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('website', e); }}
                                />
                              </div>
                              <div
                                className="cursor-move select-none"
                                style={{ position: 'absolute', left: `${positionsBack.address.x}%`, top: `${positionsBack.address.y}%`, fontSize: backSizes.address }}
                                onMouseDown={(e) => onBackDragStart('address', e)}
                                onTouchStart={(e) => onBackDragStart('address', e)}
                              >
                                <strong style={{ color: hasOverrides ? (accentColor ?? selectedConfig.accentColor) : selectedConfig.accentColor }}>📍</strong> {data.address || 'Your Address, City'}
                                <span
                                  className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                  style={{ right: -6, bottom: -6 }}
                                  onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('address', e); }}
                                  onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('address', e); }}
                                />
                              </div>
                              <div
                                className="cursor-move select-none"
                                style={{ position: 'absolute', left: `${positionsBack.qr.x}%`, top: `${positionsBack.qr.y}%` }}
                                onMouseDown={(e) => onBackDragStart('qr', e)}
                                onTouchStart={(e) => onBackDragStart('qr', e)}
                              >
                                <div style={{ background: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: 8 }}>
                                  <QRCodeSVG value={`BEGIN:VCARD\nFN:${data.name}\nTITLE:${data.title}\nORG:${data.company}\nEMAIL:${data.email}\nTEL:${data.phone}\nURL:${data.website}\nADR:${data.address}\nEND:VCARD`} size={backSizes.qr} />
                                </div>
                                <span
                                  className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                  style={{ right: -6, bottom: -6 }}
                                  onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('qr', e); }}
                                  onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('qr', e); }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                }
                const sid = selectedTemplate.slice(3);
                const t = sbTemplates.find(x => x.id === sid);
                const bg = t?.background_url || undefined;
                const backBg = t?.back_background_url || t?.background_url || undefined;
                const cfg: any = t?.config || {};
                const fc = hasOverrides ? textColor : (cfg.fontColor || "#000000");
                const fs = hasOverrides ? fontSize : (cfg.fontSize || 16);
                const accent = hasOverrides ? accentColor : (cfg.accentColor || "#0ea5e9");
                const ff = hasOverrides ? selectedFont : (cfg.fontFamily || "Inter, Arial, sans-serif");
                return (
                  <>
                    <div ref={previewRef} className="w-full max-w-full relative overflow-hidden">
                      <div className="wm-screen-only" data-watermark="screen-only" />
                      {!isEditLayout && (
                        <div
                          className="w-full aspect-[1.75/1] rounded-lg border overflow-hidden p-4 relative"
                          style={{
                            backgroundColor: bg ? undefined : "#f3f4f6",
                            backgroundImage: bg ? `url(${bg})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            color: fc,
                            fontFamily: ff,
                            fontSize: `${fs}px`,
                          }}
                        >
                          <div className="w-full h-full flex items-center justify-between gap-4">
                            {data.logo ? (
                              <div className="flex-shrink-0">
                                <img src={data.logo} alt="Logo" className="w-16 h-16 object-cover rounded-full border border-white/50 shadow" />
                              </div>
                            ) : <div />}
                            <div className="flex flex-col text-right leading-snug">
                              <h3 className="font-bold" style={{ fontFamily: ff, fontSize: fs + 6 }}>{data.name || "Your Name"}</h3>
                              <p style={{ color: accent, fontSize: fs + 2 }}>{data.title || "Job Title"}</p>
                              <p className="opacity-80" style={{ fontSize: Math.max(12, fs) }}>{data.company || "Company"}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {isEditLayout && (
                        <div
                          className="w-full aspect-[1.75/1] rounded-lg border overflow-hidden p-4 relative"
                          style={{
                            backgroundColor: bg ? undefined : "#f3f4f6",
                            backgroundImage: bg ? `url(${bg})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            color: fc,
                            fontFamily: ff,
                            fontSize: `${fs}px`,
                          }}
                        >
                          {/* Draggable text overlays */}
                          <div className="absolute inset-0">
                            <div
                              className="cursor-move select-none font-bold"
                              style={{ position: 'absolute', left: `${positions.name.x}%`, top: `${positions.name.y}%`, fontFamily: ff, fontSize: sizes.name }}
                              onMouseDown={(e) => onDragStart('name', e)}
                              onTouchStart={(e) => onDragStart('name', e)}
                            >
                              {data.name || 'Your Name'}
                              <span
                                className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                style={{ right: -6, bottom: -6 }}
                                onMouseDown={(e) => { e.stopPropagation(); onResizeStart('name', e); }}
                                onTouchStart={(e) => { e.stopPropagation(); onResizeStart('name', e); }}
                              />
                            </div>
                            <div
                              className="cursor-move select-none"
                              style={{ position: 'absolute', left: `${positions.title.x}%`, top: `${positions.title.y}%`, color: accent, fontFamily: ff, fontSize: sizes.title }}
                              onMouseDown={(e) => onDragStart('title', e)}
                              onTouchStart={(e) => onDragStart('title', e)}
                            >
                              {data.title || 'Job Title'}
                              <span
                                className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                style={{ right: -6, bottom: -6 }}
                                onMouseDown={(e) => { e.stopPropagation(); onResizeStart('title', e); }}
                                onTouchStart={(e) => { e.stopPropagation(); onResizeStart('title', e); }}
                              />
                            </div>
                            <div
                              className="cursor-move select-none opacity-80"
                              style={{ position: 'absolute', left: `${positions.company.x}%`, top: `${positions.company.y}%`, fontFamily: ff, fontSize: sizes.company }}
                              onMouseDown={(e) => onDragStart('company', e)}
                              onTouchStart={(e) => onDragStart('company', e)}
                            >
                              {data.company || 'Company'}
                              <span
                                className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                style={{ right: -6, bottom: -6 }}
                                onMouseDown={(e) => { e.stopPropagation(); onResizeStart('company', e); }}
                                onTouchStart={(e) => { e.stopPropagation(); onResizeStart('company', e); }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={backRef} className="w-full max-w-full relative overflow-hidden">
                      <div className="wm-screen-only" data-watermark="screen-only" />
                      {!isEditLayout && (
                        <div
                          className="w-full aspect-[1.75/1] rounded-lg border overflow-hidden"
                          style={{
                            backgroundColor: backBg ? undefined : "#f3f4f6",
                            backgroundImage: backBg ? `url(${backBg})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="w-full h-full p-4">
                            <BackSideCard
                              data={data}
                              textColor={fc}
                              accentColor={accent}
                              fontFamily={ff}
                              fontSize={fs}
                              showLargeQR={false}
                              qrSize={68}
                              compact={true}
                              transparentBg={true}
                            />
                          </div>
                        </div>
                      )}
                      {isEditLayout && (
                        <div
                          className="w-full aspect-[1.75/1] rounded-lg border overflow-hidden relative"
                          style={{
                            backgroundColor: backBg ? undefined : "#f3f4f6",
                            backgroundImage: backBg ? `url(${backBg})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            color: fc,
                            fontFamily: ff,
                            fontSize: `${fs}px`,
                          }}
                        >
                          <div className="absolute inset-0">
                            <div
                              className="cursor-move select-none"
                              style={{ position: 'absolute', left: `${positionsBack.email.x}%`, top: `${positionsBack.email.y}%`, fontSize: backSizes.email }}
                              onMouseDown={(e) => onBackDragStart('email', e)}
                              onTouchStart={(e) => onBackDragStart('email', e)}
                            >
                              <strong style={{ color: accent }}>✉</strong> {data.email || 'email@example.com'}
                              <span
                                className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                style={{ right: -6, bottom: -6 }}
                                onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('email', e); }}
                                onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('email', e); }}
                              />
                            </div>
                            <div
                              className="cursor-move select-none"
                              style={{ position: 'absolute', left: `${positionsBack.phone.x}%`, top: `${positionsBack.phone.y}%`, fontSize: backSizes.phone }}
                              onMouseDown={(e) => onBackDragStart('phone', e)}
                              onTouchStart={(e) => onBackDragStart('phone', e)}
                            >
                              <strong style={{ color: accent }}>✆</strong> {data.phone || '+91 00000 00000'}
                              <span
                                className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                style={{ right: -6, bottom: -6 }}
                                onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('phone', e); }}
                                onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('phone', e); }}
                              />
                            </div>
                            <div
                              className="cursor-move select-none"
                              style={{ position: 'absolute', left: `${positionsBack.website.x}%`, top: `${positionsBack.website.y}%`, fontSize: backSizes.website }}
                              onMouseDown={(e) => onBackDragStart('website', e)}
                              onTouchStart={(e) => onBackDragStart('website', e)}
                            >
                              <strong style={{ color: accent }}>⌂</strong> {data.website || 'your-website.com'}
                              <span
                                className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                style={{ right: -6, bottom: -6 }}
                                onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('website', e); }}
                                onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('website', e); }}
                              />
                            </div>
                            <div
                              className="cursor-move select-none"
                              style={{ position: 'absolute', left: `${positionsBack.address.x}%`, top: `${positionsBack.address.y}%`, fontSize: backSizes.address }}
                              onMouseDown={(e) => onBackDragStart('address', e)}
                              onTouchStart={(e) => onBackDragStart('address', e)}
                            >
                              <strong style={{ color: accent }}>📍</strong> {data.address || 'Your Address, City'}
                              <span
                                className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                style={{ right: -6, bottom: -6 }}
                                onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('address', e); }}
                                onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('address', e); }}
                              />
                            </div>
                            <div
                              className="cursor-move select-none"
                              style={{ position: 'absolute', left: `${positionsBack.qr.x}%`, top: `${positionsBack.qr.y}%` }}
                              onMouseDown={(e) => onBackDragStart('qr', e)}
                              onTouchStart={(e) => onBackDragStart('qr', e)}
                            >
                              <div style={{ background: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: 8 }}>
                                <QRCodeSVG value={`BEGIN:VCARD\nFN:${data.name}\nTITLE:${data.title}\nORG:${data.company}\nEMAIL:${data.email}\nTEL:${data.phone}\nURL:${data.website}\nADR:${data.address}\nEND:VCARD`} size={backSizes.qr} />
                              </div>
                              <span
                                className="absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize"
                                style={{ right: -6, bottom: -6 }}
                                onMouseDown={(e) => { e.stopPropagation(); onBackResizeStart('qr', e); }}
                                onTouchStart={(e) => { e.stopPropagation(); onBackResizeStart('qr', e); }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border animate-fade-in [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Classic Templates</h2>
        {combined.length === 0 ? (
          <div className="text-sm text-muted-foreground">No classic templates available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagedTemplates.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setSelectedTemplate(item.id)}
                  className={`group relative rounded-lg overflow-hidden transition-all duration-300 border-2 ${selectedTemplate === item.id
                      ? "border-primary shadow-[var(--shadow-hover)]"
                      : "border-border hover:border-primary/50 hover:shadow-[var(--shadow-card)]"
                    }`}
                >
                  {selectedTemplate === item.id && (
                    <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  {item.kind === "classic" ? (
                    <>
                      <div
                        ref={(el) => { cardRefs.current[item.id] = el; }}
                        className="pointer-events-none aspect-[1.75/1] w-full relative"
                      >
                        <ClassicCard
                          data={data}
                          config={item.classic}
                          fontFamily={hasOverrides ? selectedFont : undefined}
                          fontSize={hasOverrides ? fontSize : undefined}
                          textColor={hasOverrides ? textColor : undefined}
                          accentColor={hasOverrides ? accentColor : undefined}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white font-medium text-sm">{item.classic.name}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const t = item.server;
                        const bg = t?.thumbnail_url || t?.background_url || undefined;
                        const cfg: any = t?.config || {};
                        const fc = cfg.fontColor || "#000000";
                        const fs = cfg.fontSize || 16;
                        const accent = cfg.accentColor || "#0ea5e9";
                        const ff = cfg.fontFamily || "Inter, Arial, sans-serif";
                        const nameSize = Math.max(18, fs + 4);
                        const titleSize = Math.max(16, fs + 2);
                        return (
                          <div
                            className="pointer-events-none aspect-[1.75/1] w-full relative"
                            style={{
                              backgroundColor: bg ? undefined : "#f3f4f6",
                              backgroundImage: bg ? `url(${bg})` : undefined,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              color: fc,
                              fontFamily: ff,
                            }}
                          >
                            <div className="w-full h-full px-5 py-4 flex items-center justify-between gap-4">
                              {data.logo ? (
                                <div className="flex-shrink-0">
                                  <img src={data.logo} alt="Logo" className="w-16 h-16 object-cover rounded-full border border-white/50 shadow" />
                                </div>
                              ) : <div />}
                              <div className="flex flex-col text-right leading-snug">
                                <div className="font-semibold" style={{ fontFamily: ff, fontSize: nameSize }}>
                                  {data.name || "Your Name"}
                                </div>
                                <div style={{ color: accent, fontSize: titleSize }}>{data.title || "Job Title"}</div>
                                <div className="opacity-80" style={{ fontSize: Math.max(14, fs) }}>{data.company || "Company"}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white font-medium text-sm">{item.server?.name || "Template"}</p>
                      </div>
                    </>
                  )}
                </button>
                {/* tile quick download removed in commerce flow */}
              </div>
            ))}
          </div>
        )}
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              Prev
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
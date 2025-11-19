import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface BusinessCardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logo?: string; // data URL for company logo
}

interface BusinessCardFormProps {
  data: BusinessCardData;
  onChange: (data: BusinessCardData) => void;
}

export const BusinessCardForm = ({ data, onChange }: BusinessCardFormProps) => {
  const handleChange = (field: keyof BusinessCardData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleLogoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      onChange({ ...data, logo: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border animate-fade-in w-full max-w-md mx-auto lg:max-w-none">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Your Details</h2>
      <div className="space-y-4">
        <div className="group">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="John Doe"
            className="mt-1 transition-all focus:scale-[1.02]"
          />
        </div>
        <div className="group">
          <Label htmlFor="title">Job Title </Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Chief Executive Officer"
            className="mt-1 transition-all focus:scale-[1.02]"
          />
        </div>
        <div className="group">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            value={data.company}
            onChange={(e) => handleChange("company", e.target.value)}
            placeholder="Acme Corporation"
            className="mt-1 transition-all focus:scale-[1.02]"
          />
        </div>
        <div className="group">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="john@example.com"
            className="mt-1 transition-all focus:scale-[1.02]"
          />
        </div>
        <div className="group">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="mt-1 transition-all focus:scale-[1.02]"
          />
        </div>
        <div className="group">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={data.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="www.example.com"
            className="mt-1 transition-all focus:scale-[1.02]"
          />
        </div>
        <div className="group">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="123 Business St, Suite 100, City, State 12345"
            className="mt-1 resize-none transition-all focus:scale-[1.02]"
            rows={3}
          />
        </div>

        <div className="group">
          <Label htmlFor="logo">Company Logo</Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
            className="mt-1"
          />
          {data.logo && (
            <div className="mt-2 flex items-center gap-3">
              <img src={data.logo} alt="Logo preview" className="h-10 w-10 object-contain rounded" />
              <button
                type="button"
                className="text-xs text-red-600 underline"
                onClick={() => onChange({ ...data, logo: "" })}
              >
                Remove logo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

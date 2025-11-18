import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { BusinessCardForm, BusinessCardData } from "@/components/BusinessCardForm";
import { TemplateSelector } from "@/components/TemplateSelector";
import { CustomizationPanel } from "@/components/CustomizationPanel";
import { PaymentBanner } from "@/components/PaymentBanner";
import { PaymentFeatures } from "@/components/PaymentFeatures";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Twitter, Instagram, Linkedin, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/services/api";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [businessData, setBusinessData] = useState<BusinessCardData>({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    logo: "",
  });

  const [selectedFont, setSelectedFont] = useState<string>("Arial, sans-serif");
  const [fontSize, setFontSize] = useState<number>(16);
  const [textColor, setTextColor] = useState<string>("#000000");
  const [accentColor, setAccentColor] = useState<string>("#0ea5e9");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast("Please fill in all fields.");
      return;
    }
    try {
      setSubmitting(true);
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
      });
      toast("Thanks! We'll get back to you soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      toast(err?.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-transparent">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 dark:bg-neutral-900/40 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-4 py-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/ChatGPT Image Nov 14, 2025, 10_52_55 AM.png" alt="BusinessCard" className="h-14 w-auto select-none" />
            </Link>
            <div className="hidden md:flex flex-1 justify-center px-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  aria-label="Search"
                  className="pl-10 rounded-full bg-white/10 border-white/20 placeholder-white/60 focus-visible:ring-0 focus:bg-white/15"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/cart" className="rounded-full px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm transition-all hover:shadow-md">Cart</Link>
              {user ? (
                <>
                  {profile?.role === "admin" && (
                    <Link to="/admin/templates" className="rounded-full px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm transition-all hover:shadow-md">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                    className="rounded-full px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm transition-all hover:shadow-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="rounded-full px-4 py-2 text-sm w-full text-center bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm transition-all hover:shadow-md">
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <Hero />
      <PaymentBanner />

      <main className="container mx-auto max-w-7xl px-4 py-12">
        {/* Form + Customization */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <BusinessCardForm data={businessData} onChange={setBusinessData} />
          </div>

          <div className="space-y-6">
            {/* Customization Panel */}
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border animate-fade-in [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
              <CustomizationPanel
                selectedFont={selectedFont}
                onFontSelect={setSelectedFont}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                textColor={textColor}
                onTextColorChange={setTextColor}
                accentColor={accentColor}
                onAccentColorChange={setAccentColor}
              />
            </div>
          </div>
        </div>

        {/* Classic Templates Only */}
        <div id="classic-templates" className="animate-fade-in [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
          <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
            <TemplateSelector
              data={businessData}
              selectedFont={selectedFont}
              fontSize={fontSize}
              textColor={textColor}
              accentColor={accentColor}
            />
          </div>
        </div>
      </main>

      {/* Payment Features */}
      <PaymentFeatures />


      {/* Contact Section */}
      <section id="contact" className="border-t border-border bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-16 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Contact Us</h2>
            <p className="text-muted-foreground">Have questions or feature requests? Send us a message and we’ll respond shortly.</p>
          </div>
          <form onSubmit={handleContactSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-[var(--shadow-card)]">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input id="contact-name" placeholder="Your name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" type="email" placeholder="you@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea id="contact-message" placeholder="How can we help?" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={5} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send Message"}</Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900 py-8 mt-16 text-neutral-300">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 py-6 text-sm">
            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">About</h4>
              <ul className="space-y-2">
                <li><a className="hover:text-white" href="#about">About Us</a></li>
                <li><a className="hover:text-white" href="#contact">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Help</h4>
              <ul className="space-y-2">
                <li><Link className="hover:text-white" to="/faq">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Consumer Policy</h4>
              <ul className="space-y-2">
                <li><Link className="hover:text-white" to="/return-policy">Return Policy</Link></li>
                <li><Link className="hover:text-white" to="/refund-policy">Refund Policy</Link></li>
                <li><Link className="hover:text-white" to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link className="hover:text-white" to="/terms">Terms of Use</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Social</h4>
              <ul className="flex items-center gap-4">
                <li>
                  <a aria-label="Facebook" href="https://www.facebook.com" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full p-2 hover:bg-neutral-800">
                    <Facebook className="w-5 h-5" strokeWidth={2.5} />
                  </a>
                </li>
                <li>
                  <a aria-label="Twitter" href="https://www.twitter.com" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full p-2 hover:bg-neutral-800">
                    <Twitter className="w-5 h-5" strokeWidth={2.5} />
                  </a>
                </li>
                <li>
                  <a aria-label="Instagram" href="https://www.instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full p-2 hover:bg-neutral-800">
                    <Instagram className="w-5 h-5" strokeWidth={2.5} />
                  </a>
                </li>
                <li>
                  <a aria-label="LinkedIn" href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full p-2 hover:bg-neutral-800">
                    <Linkedin className="w-5 h-5" strokeWidth={2.5} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 py-4 flex items-center justify-start text-xs">
            <p className="text-neutral-400">© 2025 Business Card Creator</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
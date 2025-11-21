import { CreditCard, Sparkles, Check } from "lucide-react";
import { Button } from "./ui/button";

export const PaymentBanner = () => {
    return (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border">
            < div className="container mx-auto max-w-7xl px-4 py-4">
                < div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    < div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            < Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Premium Business Cards Starting at ₹2.99
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Instant download • HD Quality • No watermarks
                            </p >
                        </div >
                    </div >

                    <div className="flex items-center gap-4">
                        < div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                            < div className="flex items-center gap-1">
                                < Check className="w-4 h-4 text-green-500" />
                                <span> Secure Payment</span>
                            </div >
                            <div className="flex items-center gap-1">
                                < Check className="w-4 h-4 text-green-500" />
                                <span> Instant Access</span>
                            </div >
                        </div >
                        <Button asChild size="sm" className="gap-2 shadow-lg">
                            <a href="#classic-templates">
                                < CreditCard className="w-4 h-4" />
                                View Cards
                            </a>
                        </Button >
                    </div >
                </div >
            </div >
        </div >
    );
};

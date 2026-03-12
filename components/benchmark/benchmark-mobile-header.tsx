"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BenchmarkAsideContent } from "./benchmark-aside";

interface BenchmarkMobileHeaderProps {
  currentStep: 1 | 2 | 3;
}

export function BenchmarkMobileHeader({ currentStep }: BenchmarkMobileHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-sm font-semibold">CCF Benchmark</h2>
          <p className="text-xs text-muted-foreground">Step {currentStep} of 3</p>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
            </SheetHeader>
            <div className="py-6">
              <BenchmarkAsideContent currentStep={currentStep} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BenchmarkEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function BenchmarkEmailDialog({
  open,
  onOpenChange,
  onSubmit,
}: BenchmarkEmailDialogProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) return;
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive your result</DialogTitle>
          <DialogDescription>
            Enter your email address to receive your climate contributive potential.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="email" className="text-base">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            className="h-12 text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && email) {
                handleSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!email}
            size="lg"
            className="h-12 text-base"
          >
            Receive the result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

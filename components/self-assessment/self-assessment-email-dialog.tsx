"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Blob, BlobContent, BlobHeader, BlobActions } from "@/components/blob/blob";
import { Title } from "@/components/blob/title";
import { Subtitle } from "@/components/blob/subtitle";
import { Marker } from "@/components/blob/marker";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Mail, ArrowRight } from "lucide-react";

interface SelfAssessmentEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string) => void;
  hasData?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
}

export function SelfAssessmentEmailDialog({
  open,
  onOpenChange,
  onSubmit,
  hasData = true,
  isSubmitting = false,
  error = null,
}: SelfAssessmentEmailDialogProps) {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showError, setShowError] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(validateEmail(value));
    // Reset error when user types again
    if (showError) {
      setShowError(false);
    }
  };

  const handleSubmit = () => {
    if (!isValid || isSubmitting) {
      if (!isValid) setShowError(true);
      return;
    }
    onSubmit(email);
    // Reset after submission only if successful (will be handled by parent)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-md xl:p-12">
        <Blob
          responsive={{
            base: {
              layout: "stack",
              size: "lg",
              marker: "left",
              actions: "after",
            },
          }}
        >
          <VisuallyHidden.Root>
            <DialogTitle>{hasData ? "Receive your result" : "Receive all information"}</DialogTitle>
          </VisuallyHidden.Root>

          <Marker className="[&_svg]:text-lime-500 blob-size-md" variant="ghost">
            <Mail />
          </Marker>

          <BlobHeader>
            <Title as="h2" emphasisText={hasData ? "your result" : "all information"}>
              {hasData ? "Receive your result" : "Receive all information"}
            </Title>
            <Subtitle>
              {hasData
                ? "Enter your email address to receive your personalized climate contributive potential report"
                : "Enter your email address and we'll get back to you with personalized information about your sector"
              }
            </Subtitle>
          </BlobHeader>

          <BlobContent className="space-y-3 border-t pt-4">
            <Label htmlFor="email" className="text-base font-medium">
              Email address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="h-14 text-base pr-12"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
                autoFocus
                disabled={isSubmitting}
              />
              {isValid && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="size-6 rounded-full bg-lime-500 flex items-center justify-center">
                    <svg
                      className="size-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            {showError && !isValid && (
              <p className="text-sm text-red-500">
                Please enter a valid email address
              </p>
            )}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                {error}
              </div>
            )}
          </BlobContent>

          <BlobActions layout="stack" className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              size="lg"
              className="w-full font-semibold group"
            >
              <span>
                {isSubmitting
                  ? "Submitting..."
                  : hasData
                  ? "Receive the result"
                  : "Receive all information"}
              </span>
              {!isSubmitting && (
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              )}
            </Button>

          </BlobActions>
        </Blob>
      </DialogContent>
    </Dialog>
  );
}

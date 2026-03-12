"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportRequestFormProps {
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ReportRequestForm({ onBack, onSubmit }: ReportRequestFormProps) {
  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="w-full max-w-xl">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="text-base">First name</Label>
              <Input
                id="firstname"
                placeholder="Jane"
                autoComplete="given-name"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname" className="text-base">Last name</Label>
              <Input
                id="lastname"
                placeholder="Smith"
                autoComplete="family-name"
                className="h-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="text-base">Company</Label>
            <Input
              id="company"
              placeholder="Acme Corp"
              autoComplete="organization"
              className="h-12"
              required
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 h-12"
              onClick={onBack}
            >
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1 h-12">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

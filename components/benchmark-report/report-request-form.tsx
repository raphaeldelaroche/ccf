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
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Request your full scorecard</h1>
          <p className="text-muted-foreground text-sm">
            A CCF expert will get back to you with your personalised scorecard.
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstname">First name</Label>
              <Input
                id="firstname"
                placeholder="Jane"
                autoComplete="given-name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Last name</Label>
              <Input
                id="lastname"
                placeholder="Smith"
                autoComplete="family-name"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Acme Corp"
              autoComplete="organization"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onBack}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitForm } from "@/packages/package-form/utils/submit-form";
import { CheckCircle } from "lucide-react";

interface ScorecardRequestFormProps {
  formId: number;
  onSuccess?: () => void;
  initialSector?: string;
  initialSize?: string;
  initialGeography?: string;
  initialEmail?: string;
}

// Helper component for labels with prefilled indicator
function LabelWithCheck({ htmlFor, children, isPrefilled }: { htmlFor: string; children: React.ReactNode; isPrefilled: boolean }) {
  return (
    <Label htmlFor={htmlFor} className="text-base flex items-center gap-2">
      {children}
      {isPrefilled && (
        <span className="inline-flex items-center gap-1 text-xs font-normal text-lime-500 dark:text-green-500">
          <CheckCircle className="size-4" />
          <span className="sr-only">Pre-filled</span>
        </span>
      )}
    </Label>
  );
}

// Options for Sector field (Field 1)
const SECTOR_OPTIONS = [
  { text: "Technology / Software / IT", value: "technology" },
  { text: "Marketing / Advertising / Communications", value: "marketing" },
  { text: "Media / Entertainment / Publishing", value: "media" },
  { text: "Professional Services / Consulting", value: "professional_services" },
  { text: "Accounting / Audit / Legal / HR", value: "accounting_legal" },
  { text: "Financial Services / Banking", value: "financial_services" },
  { text: "Insurance", value: "insurance" },
  { text: "Real Estate", value: "real_estate" },
  { text: "Construction / Infrastructure", value: "construction" },
  { text: "Manufacturing / Engineering", value: "manufacturing" },
  { text: "Automotive", value: "automotive" },
  { text: "Energy / Utilities / Oil & Gas", value: "energy_utilities" },
  { text: "Oil & Gas", value: "oil_gas" },
  { text: "Electricity", value: "electricity" },
  { text: "Waste Management", value: "waste" },
  { text: "Transportation / Logistics / Supply Chain", value: "transportation" },
  { text: "Retail", value: "retail" },
  { text: "Hospitality / Tourism / Travel", value: "hospitality" },
  { text: "Food & Beverage", value: "food_beverage" },
  { text: "Healthcare / Medical / Hospitals", value: "healthcare" },
  { text: "Pharmaceuticals / Biotechnology", value: "pharma_biotech" },
  { text: "Education / Training / E-learning", value: "education" },
  { text: "Non-profit / NGO", value: "nonprofit" },
  { text: "Public Sector / Government", value: "government" },
  { text: "Agriculture / Forestry / Fishing", value: "agriculture" },
  { text: "Arts / Design / Creative Services", value: "arts_design" },
  { text: "Consumer Goods", value: "consumer_goods" },
  { text: "Telecommunications", value: "telecom" },
  { text: "Other", value: "other" }
];

// Options for Company Size field (Field 2)
const SIZE_OPTIONS = [
  { text: "1 – 49 employees", value: "tpe" },
  { text: "50 – 249 employees", value: "pme" },
  { text: "250 – 4,999 employees", value: "eti" },
  { text: "5,000+ employees", value: "ge" }
];

// Options for Geography field (Field 3)
const GEOGRAPHY_OPTIONS = [
  { text: "Europe", value: "europe" },
  { text: "North America", value: "north_america" },
  { text: "Asia-Pacific", value: "asia_pacific" },
  { text: "Latin America", value: "latin_america" },
  { text: "Africa & Middle East", value: "africa_middle_east" },
  { text: "Global (no dominant region)", value: "global" }
];

export function ScorecardRequestForm({
  formId,
  onSuccess,
  initialSector = "",
  initialSize = "",
  initialGeography = "",
  initialEmail = ""
}: ScorecardRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sector, setSector] = useState<string>(initialSector);
  const [size, setSize] = useState<string>(initialSize);
  const [geography, setGeography] = useState<string>(initialGeography);
  const [email, setEmail] = useState<string>(initialEmail);
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [company, setCompany] = useState<string>("");

  // Update form values when initial props change (e.g., after fetching entry data)
  useEffect(() => {
    if (initialSector) setSector(initialSector);
  }, [initialSector]);

  useEffect(() => {
    if (initialSize) setSize(initialSize);
  }, [initialSize]);

  useEffect(() => {
    if (initialGeography) setGeography(initialGeography);
  }, [initialGeography]);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  // Email validation helper
  const isEmailValid = (email: string) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Field validation helpers
  const isFieldValid = (value: string) => value.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Préparer les valeurs des champs pour Gravity Forms
    const fieldValues = [
      {
        id: 1, // Sector field ID
        value: sector,
      },
      {
        id: 2, // Company size field ID
        value: size,
      },
      {
        id: 3, // Geography field ID
        value: geography,
      },
      {
        id: 4, // First name field ID
        value: firstname,
      },
      {
        id: 5, // Last name field ID
        value: lastname,
      },
      {
        id: 6, // Company field ID
        value: company,
      },
      {
        id: 7, // Email field ID
        emailValues: {
          value: email,
        },
      },
    ];

    // Créer FormData pour la soumission
    const submitData = new FormData();
    submitData.set("formId", formId.toString());
    submitData.set("fieldValues", JSON.stringify(fieldValues));

    try {
      const result = await submitForm(submitData);

      if (result.success) {
        setSuccess(true);
        // Reset form fields
        setSector("");
        setSize("");
        setGeography("");
        setEmail("");
        setFirstname("");
        setLastname("");
        setCompany("");
        onSuccess?.();
      } else {
        setError(result.error || "An error occurred while submitting the form");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
        <p className="text-muted-foreground">
          A CCF expert will get back to you and guide you through your climate contribution journey.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
          {error}
        </div>
      )}

      {/* Row 1: Sector + Size */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <LabelWithCheck htmlFor="sector" isPrefilled={isFieldValid(sector)}>
            What is your main sector of activity?
          </LabelWithCheck>
          <Select value={sector} onValueChange={setSector} required disabled={isSubmitting}>
            <SelectTrigger id="sector" className="w-full !h-12">
              <SelectValue placeholder="Select your sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <LabelWithCheck htmlFor="size" isPrefilled={isFieldValid(size)}>
            What is the size of your company?
          </LabelWithCheck>
          <Select value={size} onValueChange={setSize} required disabled={isSubmitting}>
            <SelectTrigger id="size" className="w-full !h-12">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Geography + Company */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <LabelWithCheck htmlFor="geography" isPrefilled={isFieldValid(geography)}>
            Where are most of your operations based?
          </LabelWithCheck>
          <Select value={geography} onValueChange={setGeography} required disabled={isSubmitting}>
            <SelectTrigger id="geography" className="w-full !h-12">
              <SelectValue placeholder="Select geographic area" />
            </SelectTrigger>
            <SelectContent>
              {GEOGRAPHY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <LabelWithCheck htmlFor="company" isPrefilled={isFieldValid(company)}>
            Company
          </LabelWithCheck>
          <Input
            id="company"
            name="company"
            placeholder="Acme Corp"
            autoComplete="organization"
            className="h-12"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Row 3: First name + Last name */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <LabelWithCheck htmlFor="firstname" isPrefilled={isFieldValid(firstname)}>
            First name
          </LabelWithCheck>
          <Input
            id="firstname"
            name="firstname"
            placeholder="Jane"
            autoComplete="given-name"
            className="h-12"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <LabelWithCheck htmlFor="lastname" isPrefilled={isFieldValid(lastname)}>
            Last name
          </LabelWithCheck>
          <Input
            id="lastname"
            name="lastname"
            placeholder="Smith"
            autoComplete="family-name"
            className="h-12"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Row 4: Email (full width) */}
      <div className="space-y-2">
        <LabelWithCheck htmlFor="email" isPrefilled={isEmailValid(email)}>
          Email
        </LabelWithCheck>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jane.smith@example.com"
          autoComplete="email"
          className="h-12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full h-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}

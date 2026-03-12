// ============================================================================
// CCF Benchmark — Données du formulaire (front uniquement)
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Option {
  id: string;
  label: string;
}

interface Step {
  id: string;
  title: string;
  nextLabel: string;
  inputType: "combobox" | "radio-buttons";
  options: Option[];
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const STEPS: Step[] = [
  {
    id: "sector",
    title: "What is your company's industry sector?",
    nextLabel: "Continue → Company size",
    inputType: "combobox",
    options: [
      { id: "technology", label: "Technology / Software / IT" },
      { id: "marketing", label: "Marketing / Advertising / Communications" },
      { id: "media", label: "Media / Entertainment / Publishing" },
      { id: "professional_services", label: "Professional Services / Consulting" },
      { id: "accounting_legal", label: "Accounting / Audit / Legal / HR" },
      { id: "financial_services", label: "Financial Services / Banking" },
      { id: "insurance", label: "Insurance" },
      { id: "real_estate", label: "Real Estate" },
      { id: "construction", label: "Construction / Infrastructure" },
      { id: "manufacturing", label: "Manufacturing / Engineering" },
      { id: "automotive", label: "Automotive" },
      { id: "energy_utilities", label: "Energy / Utilities / Oil & Gas" },
      { id: "oil_gas", label: "Oil & Gas" },
      { id: "electricity", label: "Electricity" },
      { id: "waste", label: "Waste Management" },
      { id: "transportation", label: "Transportation / Logistics / Supply Chain" },
      { id: "retail", label: "Retail" },
      { id: "hospitality", label: "Hospitality / Tourism / Travel" },
      { id: "food_beverage", label: "Food & Beverage" },
      { id: "healthcare", label: "Healthcare / Medical / Hospitals" },
      { id: "pharma_biotech", label: "Pharmaceuticals / Biotechnology" },
      { id: "education", label: "Education / Training / E-learning" },
      { id: "nonprofit", label: "Non-profit / NGO" },
      { id: "government", label: "Public Sector / Government" },
      { id: "agriculture", label: "Agriculture / Forestry / Fishing" },
      { id: "arts_design", label: "Arts / Design / Creative Services" },
      { id: "consumer_goods", label: "Consumer Goods" },
      { id: "telecom", label: "Telecommunications" },
      { id: "other", label: "Other (please specify)" },
    ],
  },
  {
    id: "size",
    title: "What is the size of your company?",
    nextLabel: "Continue → Geographic area",
    inputType: "radio-buttons",
    options: [
      { id: "tpe", label: "1 – 49 employees" },
      { id: "pme", label: "50 – 249 employees" },
      { id: "eti", label: "250 – 4,999 employees" },
      { id: "ge", label: "5,000+ employees" },
    ],
  },
  {
    id: "geography",
    title: "Where are most of your operations based?",
    nextLabel: "Receive my contributive potential",
    inputType: "radio-buttons",
    options: [
      { id: "europe", label: "Europe" },
      { id: "north_america", label: "North America" },
      { id: "asia_pacific", label: "Asia-Pacific" },
      { id: "latin_america", label: "Latin America" },
      { id: "africa_middle_east", label: "Africa & Middle East" },
      { id: "global", label: "Global (no dominant region)" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { STEPS };

export type { Option, Step };
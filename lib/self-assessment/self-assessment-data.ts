// ============================================================================
// CCF Self-Assessment — Données du formulaire (front uniquement)
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Option {
  id: string;
  label: string;
  icon?: string;
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
    title: "What is your main sector of activity?",
    nextLabel: "Continue → Company size",
    inputType: "combobox",
    options: [
      { id: "technology", label: "Technology / Software / IT", icon: "Laptop" },
      { id: "marketing", label: "Marketing / Advertising / Communications", icon: "Megaphone" },
      { id: "media", label: "Media / Entertainment / Publishing", icon: "Film" },
      { id: "professional_services", label: "Professional Services / Consulting", icon: "Briefcase" },
      { id: "accounting_legal", label: "Accounting / Audit / Legal / HR", icon: "Scale" },
      { id: "financial_services", label: "Financial Services / Banking", icon: "Building2" },
      { id: "insurance", label: "Insurance", icon: "Shield" },
      { id: "real_estate", label: "Real Estate", icon: "Home" },
      { id: "construction", label: "Construction / Infrastructure", icon: "HardHat" },
      { id: "manufacturing", label: "Manufacturing / Engineering", icon: "Factory" },
      { id: "automotive", label: "Automotive", icon: "Car" },
      { id: "energy_utilities", label: "Energy / Utilities / Oil & Gas", icon: "Zap" },
      { id: "oil_gas", label: "Oil & Gas", icon: "Droplet" },
      { id: "electricity", label: "Electricity", icon: "Bolt" },
      { id: "waste", label: "Waste Management", icon: "Trash2" },
      { id: "transportation", label: "Transportation / Logistics / Supply Chain", icon: "Truck" },
      { id: "retail", label: "Retail", icon: "ShoppingBag" },
      { id: "hospitality", label: "Hospitality / Tourism / Travel", icon: "Plane" },
      { id: "food_beverage", label: "Food & Beverage", icon: "UtensilsCrossed" },
      { id: "healthcare", label: "Healthcare / Medical / Hospitals", icon: "Heart" },
      { id: "pharma_biotech", label: "Pharmaceuticals / Biotechnology", icon: "Pill" },
      { id: "education", label: "Education / Training / E-learning", icon: "GraduationCap" },
      { id: "nonprofit", label: "Non-profit / NGO", icon: "HandHeart" },
      { id: "government", label: "Public Sector / Government", icon: "Landmark" },
      { id: "agriculture", label: "Agriculture / Forestry / Fishing", icon: "Sprout" },
      { id: "arts_design", label: "Arts / Design / Creative Services", icon: "Palette" },
      { id: "consumer_goods", label: "Consumer Goods", icon: "Package" },
      { id: "telecom", label: "Telecommunications", icon: "Radio" },
      { id: "other", label: "Other", icon: "MoreHorizontal" },
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

/**
 * Sector data for the Climate Contribution Framework self-assessment
 * Data manually copied from ccf-weightings-by-sector.csv
 *
 * Each sector has:
 * - Contribution potential across 3 pillars (alpha, beta, gamma)
 * - Total potential score (sum)
 * - Context message explaining the sector's role
 * - Display message shown based on data availability
 */

export type MessageType = "complete" | "no-data" | "financial" | "public-sector";

export interface SectorData {
  id: string;
  label: string;
  hasData: boolean;
  alpha: number;
  beta: number;
  gamma: number;
  sum: number;
  contextMessage: string;
  displayMessage: string;
  messageType: MessageType;
}

/**
 * Complete sector data map (31 sectors)
 * IDs must match those in self-assessment-data.ts
 */
export const SECTOR_DATA_MAP: Record<string, SectorData> = {
  "technology": {
    id: "technology",
    label: "Technology / Software / IT",
    hasData: true,
    alpha: 27,
    beta: 27,
    gamma: 8,
    sum: 62,
    contextMessage: "The Technology & IT sector has strong contributive potential among the 100+ sub-sectors analysed by the CCF, enabling systemic change across all industries through digital solutions.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "marketing": {
    id: "marketing",
    label: "Marketing / Advertising / Communications",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "media": {
    id: "media",
    label: "Media / Entertainment / Publishing",
    hasData: true,
    alpha: 22,
    beta: 12,
    gamma: 4,
    sum: 38,
    contextMessage: "The Media & Entertainment sector has meaningful contributive potential among the 100+ sub-sectors analysed by the CCF, with unique capacity to shape narratives and behaviors.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "consulting": {
    id: "consulting",
    label: "Professional Services / Consulting",
    hasData: true,
    alpha: 8,
    beta: 18,
    gamma: 5,
    sum: 31,
    contextMessage: "The Professional Services sector has notable contributive potential among the 100+ sub-sectors analysed by the CCF, advising and enabling transformation across all industries.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "accounting": {
    id: "accounting",
    label: "Accounting / Audit / Tax / Legal Services / HR",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "banking": {
    id: "banking",
    label: "Financial Services / Banking",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Dedicated methodology will be developed shortly for financial institutions - keep in touch!",
    messageType: "financial",
  },
  "insurance": {
    id: "insurance",
    label: "Insurance",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Dedicated methodology will be developed shortly for financial institutions - keep in touch!",
    messageType: "financial",
  },
  "real-estate": {
    id: "real-estate",
    label: "Real Estate",
    hasData: true,
    alpha: 61,
    beta: 18,
    gamma: 10,
    sum: 89,
    contextMessage: "The Real Estate sector has one of the highest contributive potentials among the 100+ sub-sectors analysed by the CCF, with significant influence on built environment and urban systems.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "construction": {
    id: "construction",
    label: "Construction / Infrastructure",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "manufacturing": {
    id: "manufacturing",
    label: "Manufacturing / Industrial / Engineering",
    hasData: true,
    alpha: 34,
    beta: 27,
    gamma: 4,
    sum: 65,
    contextMessage: "The Manufacturing & Industrial sector has strong contributive potential among the 100+ sub-sectors analysed by the CCF, with key leverage on production systems and material efficiency.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "automotive": {
    id: "automotive",
    label: "Automotive",
    hasData: true,
    alpha: 59,
    beta: 24,
    gamma: 5,
    sum: 88,
    contextMessage: "The Automotive sector has one of the highest contributive potentials among the 100+ sub-sectors analysed by the CCF, driving innovation in clean mobility and manufacturing transformation.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "energy-utilities": {
    id: "energy-utilities",
    label: "Energy / Utilities / Oil & Gas",
    hasData: true,
    alpha: 55,
    beta: 35,
    gamma: 6,
    sum: 96,
    contextMessage: "The Energy & Utilities sector ranks among the top 3 highest contributive potentials among the 100+ sub-sectors analysed by the CCF, given its foundational role in powering the transition.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "oil-gas": {
    id: "oil-gas",
    label: "Oil & Gas",
    hasData: true,
    alpha: 80,
    beta: 9,
    gamma: 10,
    sum: 99,
    contextMessage: "The Oil & Gas sector has the highest contributive potential among the 100+ sub-sectors analysed by the CCF, reflecting its critical role in the climate transition.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "oil_gas": {
    id: "oil_gas",
    label: "Oil & Gas",
    hasData: true,
    alpha: 80,
    beta: 9,
    gamma: 10,
    sum: 99,
    contextMessage: "The Oil & Gas sector has the highest contributive potential among the 100+ sub-sectors analysed by the CCF, reflecting its critical role in the climate transition.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "electricity": {
    id: "electricity",
    label: "Electricity",
    hasData: true,
    alpha: 55,
    beta: 35,
    gamma: 6,
    sum: 96,
    contextMessage: "The Electricity sector ranks among the top 3 highest contributive potentials among the 100+ sub-sectors analysed by the CCF, as a cornerstone of energy system transformation.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "waste": {
    id: "waste",
    label: "Waste",
    hasData: true,
    alpha: 50,
    beta: 40,
    gamma: 5,
    sum: 95,
    contextMessage: "The Waste sector has one of the top 5 highest contributive potentials among the 100+ sub-sectors analysed by the CCF, with major leverage across circular economy dimensions.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "transportation": {
    id: "transportation",
    label: "Transportation / Logistics / Supply Chain",
    hasData: true,
    alpha: 62,
    beta: 28,
    gamma: 5,
    sum: 95,
    contextMessage: "The Transportation & Logistics sector has one of the top 5 highest contributive potentials among the 100+ sub-sectors analysed by the CCF, spanning mobility, infrastructure and value chain transformation.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "retail": {
    id: "retail",
    label: "Retail",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "hospitality": {
    id: "hospitality",
    label: "Hospitality / Travel / Tourism",
    hasData: true,
    alpha: 61,
    beta: 18,
    gamma: 10,
    sum: 89,
    contextMessage: "The Hospitality & Tourism sector has one of the highest contributive potentials among the 100+ sub-sectors analysed by the CCF, bridging infrastructure, mobility and behavioral change.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "food-beverage": {
    id: "food-beverage",
    label: "Food & Beverage",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "healthcare": {
    id: "healthcare",
    label: "Healthcare / Medical / Hospitals",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "pharma": {
    id: "pharma",
    label: "Pharmaceuticals / Biotechnology",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "education": {
    id: "education",
    label: "Education / Training / E‑learning",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "nonprofit": {
    id: "nonprofit",
    label: "Non‑profit / NGO / Association",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "public-sector",
  },
  "government": {
    id: "government",
    label: "Government / Public Sector",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "public-sector",
  },
  "agriculture": {
    id: "agriculture",
    label: "Agriculture / Forestry / Fishing",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "arts": {
    id: "arts",
    label: "Arts / Design / Creative Services",
    hasData: true,
    alpha: 22,
    beta: 12,
    gamma: 4,
    sum: 38,
    contextMessage: "The Arts & Creative Services sector has meaningful contributive potential among the 100+ sub-sectors analysed by the CCF, influencing culture, design and sustainable innovation.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "consumer-goods": {
    id: "consumer-goods",
    label: "Consumer Goods",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "telecom": {
    id: "telecom",
    label: "Telecommunications",
    hasData: true,
    alpha: 18,
    beta: 18,
    gamma: 5,
    sum: 41,
    contextMessage: "The Telecommunications sector has significant contributive potential among the 100+ sub-sectors analysed by the CCF, supporting infrastructure for sustainable connectivity.",
    displayMessage: "Take a look at your sector's potential across all contribution dimensions!",
    messageType: "complete",
  },
  "other": {
    id: "other",
    label: "Other (please specify)",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  // Aliases for form sectors with underscores (form uses _ but data uses -)
  "energy_utilities": {
    id: "energy_utilities",
    label: "Energy / Utilities / Oil & Gas",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "food_beverage": {
    id: "food_beverage",
    label: "Food & Beverage",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "real_estate": {
    id: "real_estate",
    label: "Real Estate",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "accounting_legal": {
    id: "accounting_legal",
    label: "Accounting / Legal",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "arts_design": {
    id: "arts_design",
    label: "Arts / Design",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "consumer_goods": {
    id: "consumer_goods",
    label: "Consumer Goods",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "financial_services": {
    id: "financial_services",
    label: "Financial Services / Banking",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "financial",
  },
  "pharma_biotech": {
    id: "pharma_biotech",
    label: "Pharma / Biotech",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
  "professional_services": {
    id: "professional_services",
    label: "Professional Services / Consulting",
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    sum: 0,
    contextMessage: "",
    displayMessage: "Weightings not yet computed for this sector - Our team will send you fully customized information instead!",
    messageType: "no-data",
  },
};

/**
 * Get sector data by ID
 * @param sectorId - The sector identifier (e.g., "automotive", "technology")
 * @returns Sector data or null if not found
 */
export function getSectorData(sectorId: string): SectorData | null {
  return SECTOR_DATA_MAP[sectorId] || null;
}

/**
 * Get all sectors with available data
 * @returns Array of sectors where hasData is true
 */
export function getSectorsWithData(): SectorData[] {
  return Object.values(SECTOR_DATA_MAP).filter((sector) => sector.hasData);
}

/**
 * Validate sector data integrity
 * Ensures that alpha + beta + gamma = sum for sectors with data
 * @returns Array of sector IDs with validation errors
 */
export function validateSectorData(): string[] {
  const errors: string[] = [];

  Object.values(SECTOR_DATA_MAP).forEach((sector) => {
    if (sector.hasData) {
      const calculatedSum = sector.alpha + sector.beta + sector.gamma;
      if (calculatedSum !== sector.sum) {
        errors.push(
          `${sector.id}: Expected sum ${sector.sum}, got ${calculatedSum}`
        );
      }
    }
  });

  return errors;
}

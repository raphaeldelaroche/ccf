// Sectors from form (with underscores)
const formSectors = [
  "accounting_legal",
  "agriculture",
  "arts_design",
  "automotive",
  "construction",
  "consumer_goods",
  "education",
  "electricity",
  "energy_utilities",
  "financial_services",
  "food_beverage",
  "government",
  "healthcare",
  "hospitality",
  "insurance",
  "manufacturing",
  "marketing",
  "media",
  "nonprofit",
  "oil_gas",
  "other",
  "pharma_biotech",
  "professional_services",
  "real_estate",
  "retail",
  "technology",
  "telecom",
  "transportation",
  "waste"
];

// Sectors from data (with hyphens and underscores)
const dataSectors = [
  "accounting",
  "agriculture",
  "arts",
  "automotive",
  "banking",
  "construction",
  "consulting",
  "education",
  "electricity",
  "energy-utilities",
  "food-beverage",
  "government",
  "healthcare",
  "hospitality",
  "insurance",
  "manufacturing",
  "marketing",
  "media",
  "nonprofit",
  "oil-gas",
  "oil_gas",
  "other",
  "pharma",
  "real-estate",
  "retail",
  "technology",
  "telecom",
  "transportation",
  "waste"
];

console.log("Missing sectors (in form but not in data):");
formSectors.forEach(sector => {
  const normalized = sector.replace(/_/g, '-');
  if (!dataSectors.includes(sector) && !dataSectors.includes(normalized)) {
    console.log(`  - ${sector} (form) -> no match in data`);
  }
});

console.log("\nMismatched naming conventions:");
formSectors.forEach(sector => {
  const withHyphen = sector.replace(/_/g, '-');
  if (dataSectors.includes(withHyphen) && !dataSectors.includes(sector)) {
    console.log(`  - ${sector} (form) -> ${withHyphen} (data) - NEEDS ALIAS`);
  }
});

/**
 * Iconify icon collections configuration
 * Defines available icon sets for the IconifyPicker
 */

export interface IconifyCollection {
  id: string;
  name: string;
  author?: string;
  license?: string;
  total?: number;
}

/**
 * Available icon collections
 * Can be extended with more collections from https://icon-sets.iconify.design/
 */
export const ICONIFY_COLLECTIONS: IconifyCollection[] = [
  {
    id: "lucide",
    name: "Lucide",
    author: "Lucide Contributors",
    license: "ISC",
    total: 1500,
  },
  // {
  //   id: "tabler",
  //   name: "Tabler Icons",
  //   author: "Paweł Kuna",
  //   license: "MIT",
  //   total: 5000,
  // },
  {
    id: "mdi",
    name: "Material Design Icons",
    author: "Google",
    license: "Apache 2.0",
    total: 7000,
  },
  // {
  //   id: "heroicons",
  //   name: "Heroicons",
  //   author: "Tailwind Labs",
  //   license: "MIT",
  //   total: 300,
  // },
  // {
  //   id: "ph",
  //   name: "Phosphor",
  //   author: "Phosphor Icons",
  //   license: "MIT",
  //   total: 1200,
  // },
  // {
  //   id: "ri",
  //   name: "Remix Icon",
  //   author: "Remix Design",
  //   license: "Apache 2.0",
  //   total: 2800,
  // },
  // {
  //   id: "carbon",
  //   name: "Carbon",
  //   author: "IBM",
  //   license: "Apache 2.0",
  //   total: 2000,
  // },
  // {
  //   id: "ion",
  //   name: "Ionicons",
  //   author: "Ionic",
  //   license: "MIT",
  //   total: 1300,
  // },
];

/**
 * Default collection used when picker opens
 */
export const DEFAULT_COLLECTION = "lucide";

/**
 * Get collection by ID
 */
export function getCollection(id: string): IconifyCollection | undefined {
  return ICONIFY_COLLECTIONS.find((col) => col.id === id);
}

/**
 * Search configuration
 */
export const ICONIFY_SEARCH_CONFIG = {
  debounceMs: 300,
  maxResults: 50,
  minQueryLength: 1,
};

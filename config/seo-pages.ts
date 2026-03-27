/**
 * SEO CONFIGURATION
 *
 * Configuration centralisée des métadonnées SEO pour toutes les pages.
 *
 * Principes :
 * - Le SEO est contrôlé dans le code, pas dans Redis
 * - Permet le versioning et la review des changements SEO
 * - Évite les modifications accidentelles via l'éditeur
 * - Optimisation complète : title, description, OpenGraph, Twitter
 *
 * Pour ajouter/modifier le SEO d'une page :
 * 1. Ajouter/modifier l'entrée dans PAGE_SEO_CONFIG
 * 2. Les métadonnées sont automatiquement utilisées par generateMetadata()
 *
 * Note : Le titre dans Redis (PageData.title) sert uniquement pour l'interface
 * de l'éditeur. Le SEO utilise exclusivement cette configuration.
 */

import { Metadata } from "next"

/**
 * Configuration SEO par page (slug)
 */
export const PAGE_SEO_CONFIG: Record<string, Metadata> = {
  home: {
    title: "Climate Contribution Framework — Measure Corporate Net Zero Impact",
    description:
      "The meta-framework aggregating climate standards. Convert emissions data into comparable 0-100 scores with sector weighting. Zero additional reporting.",
    keywords: [
      "climate contribution framework",
      "net zero measurement",
      "corporate climate action",
      "ESG scoring",
      "carbon accounting",
      "SBTi",
      "scope 3 emissions",
      "climate accountability",
      "sector weighted scoring",
      "climate meta-framework",
    ],
    openGraph: {
      title: "Climate Contribution Framework — Measure Corporate Net Zero Impact",
      description:
        "Take climate action, get the credit you deserve. The comprehensive climate impact metric businesses have been missing.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Climate Contribution Framework — Measure Corporate Net Zero Impact",
      description:
        "Take climate action, get the credit you deserve. The comprehensive climate impact metric businesses have been missing.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  about: {
    title: "About CCF — Co-initiated by Sweep & Mirova Research Center",
    description:
      "The Climate Contribution Framework brings together sustainable finance research and climate data expertise. Backed by WBCSD, SBTi, and leading enterprises.",
    keywords: [
      "Sweep climate",
      "Mirova research",
      "climate framework initiative",
      "SBTi partnership",
      "WBCSD",
      "corporate climate accountability",
      "climate action framework",
      "net zero initiative",
      "climate advisory committee",
      "ESG framework",
    ],
    openGraph: {
      title: "About CCF — Co-initiated by Sweep & Mirova Research Center",
      description:
        "A shared framework for corporate climate accountability. Co-initiated by Sweep and the Mirova Research Center.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "About CCF — Co-initiated by Sweep & Mirova Research Center",
      description:
        "A shared framework for corporate climate accountability. Co-initiated by Sweep and the Mirova Research Center.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  methodology: {
    title: "CCF Methodology — Three Pillars: Reduce, Deploy, Finance",
    description:
      "Transparent, sector-weighted climate scoring. Aggregates existing frameworks into one coherent 0-100 score. Measures contribution, not just footprint.",
    keywords: [
      "climate methodology",
      "three pillar framework",
      "reduce deploy finance",
      "sector-weighted scoring",
      "avoided emissions",
      "climate solutions",
      "carbon credits",
      "scope 1 2 3",
      "climate framework aggregation",
      "net zero methodology",
      "climate contribution measurement",
    ],
    openGraph: {
      title: "CCF Methodology — Three Pillars: Reduce, Deploy, Finance",
      description:
        "Three pillars. One equation. Sector-adjusted results. The CCF does not replace existing methodologies. It builds on them.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CCF Methodology — Three Pillars: Reduce, Deploy, Finance",
      description:
        "Three pillars. One equation. Sector-adjusted results. The CCF does not replace existing methodologies. It builds on them.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  resources: {
    title: "Resources & White Paper — CCF Documentation & FAQ",
    description:
      "Download the complete CCF methodology white paper. Access publications, FAQs, and resources for companies, investors, and climate analysts.",
    keywords: [
      "climate white paper",
      "CCF methodology download",
      "climate framework FAQ",
      "net zero resources",
      "climate contribution documentation",
      "climate publications",
      "ESG resources",
      "climate framework guide",
      "corporate climate resources",
      "climate accountability documentation",
    ],
    openGraph: {
      title: "Resources & White Paper — CCF Documentation & FAQ",
      description:
        "Publications, methodology and updates. Resources for companies, investors, public decision-makers, and analysts.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Resources & White Paper — CCF Documentation & FAQ",
      description:
        "Publications, methodology and updates. Resources for companies, investors, public decision-makers, and analysts.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  contact: {
    title: "Contact CCF — Request Climate Contribution Assessment",
    description:
      "Get in touch with the Climate Contribution Framework team. Request a scorecard assessment or learn how to participate in the beta program.",
    keywords: [
      "contact CCF",
      "climate assessment request",
      "climate framework demo",
      "CCF inquiry",
      "beta program climate",
      "climate scorecard request",
      "corporate climate consultation",
      "net zero assessment",
      "climate contribution contact",
      "CCF team contact",
    ],
    openGraph: {
      title: "Contact CCF — Request Climate Contribution Assessment",
      description:
        "Any question? Just ask! Get in touch with our team to request an assessment or learn more about the Climate Contribution Framework.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Contact CCF — Request Climate Contribution Assessment",
      description:
        "Any question? Just ask! Get in touch with our team to request an assessment or learn more about the Climate Contribution Framework.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  "self-assessment": {
    title: "Self-Assessment — Climate Contribution Framework",
    description:
      "Assess your organization's climate contribution with our free tool. Interactive questionnaire, detailed results, and personalized recommendations.",
    keywords: [
      "climate self-assessment",
      "corporate climate questionnaire",
      "climate evaluation tool",
      "free climate assessment",
      "climate contribution scoring",
      "ESG self-assessment",
      "net zero evaluation",
      "climate action assessment",
      "sustainability questionnaire",
    ],
    openGraph: {
      title: "Self-Assessment — Climate Contribution Framework",
      description:
        "Assess your climate contribution with our free tool. Detailed results and recommendations to improve your climate action.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Self-Assessment — Climate Contribution Framework",
      description:
        "Assess your climate contribution with our free tool. Detailed results and recommendations to improve your climate action.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  "self-assessment-report": {
    title: "Self-Assessment Report — Climate Contribution Framework",
    description:
      "View your detailed self-assessment report. Analysis of your climate contribution, score by category, and improvement recommendations.",
    keywords: [
      "climate assessment report",
      "climate scorecard",
      "climate evaluation results",
      "climate contribution score",
      "ESG report",
      "sustainability report",
      "climate action results",
      "net zero scorecard",
      "climate performance report",
    ],
    openGraph: {
      title: "Self-Assessment Report — Climate Contribution Framework",
      description:
        "Your detailed report: score, analysis, and recommendations to improve your climate contribution and climate action.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Self-Assessment Report — Climate Contribution Framework",
      description:
        "Your detailed report: score, analysis, and recommendations to improve your climate contribution and climate action.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },
}

/**
 * Configuration SEO par défaut (fallback)
 * Utilisée quand une page n'a pas de configuration spécifique
 */
export const DEFAULT_SEO: Metadata = {
  title: "Climate Contribution Framework",
  description:
    "Measure and improve your organization's climate contribution with the meta-framework for corporate climate action.",
  robots: {
    index: false,
    follow: true,
  },
}

/**
 * Métadonnées de base pour le site (utilisées dans layout.tsx)
 */
export const SITE_METADATA: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://climate-contribution-framework.local"
  ),
  title: {
    default: "Climate Contribution Framework",
    template: "%s | Climate Contribution Framework",
  },
  description:
    "The Climate Contribution Framework helps organizations measure, understand, and improve their climate contribution through transparent, sector-weighted scoring.",
  keywords: [
    "climate contribution framework",
    "net zero measurement",
    "corporate climate action",
    "ESG scoring",
    "carbon accounting",
    "climate accountability",
    "SBTi",
    "WBCSD",
  ],
  authors: [{ name: "Climate Contribution Framework" }],
  creator: "Climate Contribution Framework",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Climate Contribution Framework",
    images: [{ url: "/cover.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

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
    title: "Climate Contribution Framework — Standardized Corporate Climate Assessment",
    description:
      "A science-based meta-framework for corporate climate accountability. Aggregates disclosure standards into sector-weighted scores through transparent α/β/γ coefficient methodology. Complements SBTi, TCFD, and GHG Protocol.",
    keywords: [
      "climate contribution framework",
      "corporate climate accountability",
      "climate disclosure standards",
      "sector-weighted climate assessment",
      "science-based climate methodology",
      "SBTi complementary framework",
      "TCFD disclosure",
      "GHG Protocol integration",
      "climate materiality assessment",
      "standardized climate scoring",
      "multi-stakeholder climate framework",
    ],
    openGraph: {
      title: "Climate Contribution Framework — Standardized Corporate Climate Assessment",
      description:
        "A science-based meta-framework for corporate climate accountability. Transparent methodology aggregating climate disclosure standards into reproducible sector-weighted assessments.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover-home.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Climate Contribution Framework — Standardized Corporate Climate Assessment",
      description:
        "A science-based meta-framework for corporate climate accountability. Transparent methodology aggregating climate disclosure standards into reproducible sector-weighted assessments.",
      images: ["/cover-home.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  about: {
    title: "About CCF — Multi-stakeholder Initiative for Climate Standardization",
    description:
      "Co-initiated by Sweep and Mirova Research Center. Developed through multi-stakeholder collaboration with climate standard bodies, research institutions, and corporate sustainability leaders. Advisory committee includes SBTi, WBCSD representatives.",
    keywords: [
      "climate framework governance",
      "multi-stakeholder climate initiative",
      "Sweep climate data",
      "Mirova sustainable finance research",
      "SBTi collaboration",
      "WBCSD partnership",
      "climate standard development",
      "corporate climate accountability governance",
      "climate advisory committee",
      "climate framework co-development",
      "institutional climate initiative",
    ],
    openGraph: {
      title: "About CCF — Multi-stakeholder Initiative for Climate Standardization",
      description:
        "A collaborative framework for corporate climate accountability. Co-initiated by Sweep and Mirova Research Center with multi-stakeholder governance and advisory oversight.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "About CCF — Multi-stakeholder Initiative for Climate Standardization",
      description:
        "A collaborative framework for corporate climate accountability. Co-initiated by Sweep and Mirova Research Center with multi-stakeholder governance and advisory oversight.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  methodology: {
    title: "CCF Methodology — Three-pillar α/β/γ Coefficient Assessment Framework",
    description:
      "Transparent, reproducible climate assessment methodology. Aggregates Reduce (α), Deploy (β), and Finance (γ) pillars into sector-weighted scores. Built on GHG Protocol, SBTi targets, avoided emissions standards, and climate finance disclosure principles.",
    keywords: [
      "climate assessment methodology",
      "three-pillar climate framework",
      "alpha beta gamma coefficients",
      "sector materiality weighting",
      "GHG Protocol integration",
      "SBTi target validation",
      "avoided emissions methodology",
      "climate finance disclosure",
      "scope 1 2 3 accounting",
      "reproducible climate scoring",
      "transparent climate methodology",
      "science-based climate assessment",
    ],
    openGraph: {
      title: "CCF Methodology — Three-pillar α/β/γ Coefficient Assessment Framework",
      description:
        "Transparent methodology built on established climate standards. Three-pillar assessment (Reduce/Deploy/Finance) with sector-specific materiality weighting. Designed to complement, not replace, existing disclosure frameworks.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CCF Methodology — Three-pillar α/β/γ Coefficient Assessment Framework",
      description:
        "Transparent methodology built on established climate standards. Three-pillar assessment (Reduce/Deploy/Finance) with sector-specific materiality weighting. Designed to complement, not replace, existing disclosure frameworks.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  resources: {
    title: "Resources — CCF Methodology Documentation & Technical Publications",
    description:
      "Access the complete CCF methodology white paper, technical documentation, and peer-reviewed publications. Resources for corporate sustainability officers, institutional investors, climate analysts, and policymakers. Includes FAQ and implementation guidance.",
    keywords: [
      "climate methodology white paper",
      "CCF technical documentation",
      "climate framework publications",
      "climate disclosure guidance",
      "climate assessment documentation",
      "corporate climate resources",
      "climate standard implementation",
      "climate methodology FAQ",
      "institutional investor climate resources",
      "climate accountability documentation",
      "peer-reviewed climate framework",
    ],
    openGraph: {
      title: "Resources — CCF Methodology Documentation & Technical Publications",
      description:
        "Technical documentation, white papers, and implementation guidance. Resources developed for corporate sustainability professionals, institutional investors, climate analysts, and public decision-makers.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Resources — CCF Methodology Documentation & Technical Publications",
      description:
        "Technical documentation, white papers, and implementation guidance. Resources developed for corporate sustainability professionals, institutional investors, climate analysts, and public decision-makers.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  contact: {
    title: "Contact CCF — Inquiries & Climate Assessment Requests",
    description:
      "Contact the Climate Contribution Framework team for methodology inquiries, partnership opportunities, or assessment requests. Information on framework adoption, technical implementation, and collaborative development.",
    keywords: [
      "CCF contact",
      "climate framework inquiry",
      "climate assessment request",
      "climate standard adoption",
      "CCF partnership",
      "climate methodology consultation",
      "corporate climate assessment inquiry",
      "climate framework implementation",
      "institutional climate consultation",
      "climate standard collaboration",
    ],
    openGraph: {
      title: "Contact CCF — Inquiries & Climate Assessment Requests",
      description:
        "Contact the Climate Contribution Framework team for methodology inquiries, partnership opportunities, or assessment requests. Information on framework adoption and technical implementation.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Contact CCF — Inquiries & Climate Assessment Requests",
      description:
        "Contact the Climate Contribution Framework team for methodology inquiries, partnership opportunities, or assessment requests. Information on framework adoption and technical implementation.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  "self-assessment": {
    title: "Self-Assessment Tool — Climate Contribution Preliminary Evaluation",
    description:
      "Preliminary climate contribution assessment based on CCF methodology. Structured questionnaire covering emissions reduction targets, climate solution deployment, and climate finance disclosure. Generates indicative scores across three pillars.",
    keywords: [
      "climate self-assessment tool",
      "preliminary climate evaluation",
      "climate contribution questionnaire",
      "corporate climate assessment tool",
      "climate disclosure self-evaluation",
      "emissions reduction assessment",
      "climate solution evaluation",
      "climate finance disclosure assessment",
      "three-pillar climate evaluation",
      "structured climate questionnaire",
    ],
    openGraph: {
      title: "Self-Assessment Tool — Climate Contribution Preliminary Evaluation",
      description:
        "Preliminary assessment tool based on CCF methodology. Structured questionnaire evaluating climate action across three pillars: emissions reduction, solution deployment, climate finance disclosure.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Self-Assessment Tool — Climate Contribution Preliminary Evaluation",
      description:
        "Preliminary assessment tool based on CCF methodology. Structured questionnaire evaluating climate action across three pillars: emissions reduction, solution deployment, climate finance disclosure.",
      images: ["/cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },

  "self-assessment-report": {
    title: "Assessment Report — Climate Contribution Evaluation Results",
    description:
      "Detailed climate contribution assessment report. Breakdown of scores across Reduce, Deploy, and Finance pillars with sector-weighted aggregation. Includes methodology references and disclosure gap analysis.",
    keywords: [
      "climate assessment report",
      "climate contribution scorecard",
      "three-pillar climate results",
      "climate disclosure analysis",
      "sector-weighted climate score",
      "emissions reduction assessment report",
      "climate solution deployment evaluation",
      "climate finance disclosure report",
      "corporate climate performance report",
      "standardized climate scorecard",
    ],
    openGraph: {
      title: "Assessment Report — Climate Contribution Evaluation Results",
      description:
        "Detailed assessment report with scores across three pillars (Reduce/Deploy/Finance), sector-weighted aggregation, and disclosure gap analysis based on CCF methodology.",
      type: "website",
      locale: "en_US",
      siteName: "Climate Contribution Framework",
      images: [{ url: "/cover.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Assessment Report — Climate Contribution Evaluation Results",
      description:
        "Detailed assessment report with scores across three pillars (Reduce/Deploy/Finance), sector-weighted aggregation, and disclosure gap analysis based on CCF methodology.",
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
    "A science-based meta-framework for standardized corporate climate accountability. Transparent methodology aggregating climate disclosure standards.",
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
    "The Climate Contribution Framework provides a transparent, science-based methodology for corporate climate accountability through standardized, sector-weighted assessment built on established climate disclosure standards.",
  keywords: [
    "climate contribution framework",
    "corporate climate accountability",
    "climate disclosure standards",
    "science-based climate methodology",
    "sector-weighted climate assessment",
    "SBTi complementary framework",
    "TCFD disclosure",
    "GHG Protocol",
    "WBCSD",
    "climate materiality",
    "standardized climate scoring",
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

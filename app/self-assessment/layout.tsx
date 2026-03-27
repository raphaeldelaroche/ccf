/**
 * LAYOUT SELF-ASSESSMENT
 *
 * Layout pour la page d'auto-évaluation.
 * Gère les métadonnées SEO via la configuration centralisée.
 */

import { getPageMetadata } from "@/lib/seo/get-page-metadata"

/**
 * Génération des métadonnées pour SEO
 */
export async function generateMetadata() {
  return getPageMetadata("self-assessment")
}

export default function SelfAssessmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

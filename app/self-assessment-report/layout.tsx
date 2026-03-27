/**
 * LAYOUT SELF-ASSESSMENT REPORT
 *
 * Layout pour la page de rapport d'auto-évaluation.
 * Gère les métadonnées SEO via la configuration centralisée.
 */

import { getPageMetadata } from "@/lib/seo/get-page-metadata"

/**
 * Génération des métadonnées pour SEO
 */
export async function generateMetadata() {
  return getPageMetadata("self-assessment-report")
}

export default function SelfAssessmentReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

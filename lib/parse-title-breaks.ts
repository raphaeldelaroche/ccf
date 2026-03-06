/**
 * Parse title breaks - Système de sauts de ligne dans les titres
 *
 * Supporte deux types de marqueurs :
 * - `//` : Saut de ligne responsive (espace sur mobile, <br> sur desktop)
 * - `///` : Saut de ligne forcé (<br> sur tous les breakpoints)
 *
 * Gère également l'emphasisText pour mettre du texte en surbrillance.
 */

export interface TitleSegment {
  type: "text" | "emphasis" | "break" | "break-responsive";
  content: string;
}

/**
 * Parse un titre avec des marqueurs de saut de ligne et de l'emphasis
 *
 * @param title - Le titre à parser (peut contenir // et ///)
 * @param emphasisText - Texte optionnel à mettre en surbrillance
 * @returns Tableau de segments à rendre
 *
 * @example
 * parseTitleWithBreaks("Climate // Contribution /// Framework", "Contribution")
 * // → [
 * //   { type: "text", content: "Climate " },
 * //   { type: "break-responsive", content: "" },
 * //   { type: "emphasis", content: "Contribution" },
 * //   { type: "break", content: "" },
 * //   { type: "text", content: " Framework" }
 * // ]
 */
export function parseTitleWithBreaks(
  title: string,
  emphasisText?: string
): TitleSegment[] {
  const segments: TitleSegment[] = [];

  // Marqueurs spéciaux pour identifier les breaks dans le texte
  const RESPONSIVE_BREAK_MARKER = "\u0001"; // ///
  const FORCE_BREAK_MARKER = "\u0002";      // //

  // Remplacer les marqueurs par des caractères spéciaux
  let processedTitle = title;
  processedTitle = processedTitle.replace(/\s*\/\/\/\s*/g, RESPONSIVE_BREAK_MARKER);
  processedTitle = processedTitle.replace(/\s*\/\/\s*/g, FORCE_BREAK_MARKER);

  // Découper le titre en segments
  const rawSegments: Array<{ text: string; breakType?: "responsive" | "force" }> = [];
  let currentIndex = 0;

  for (let i = 0; i < processedTitle.length; i++) {
    if (processedTitle[i] === RESPONSIVE_BREAK_MARKER) {
      // Sauvegarder le texte avant le break
      if (i > currentIndex) {
        rawSegments.push({ text: processedTitle.slice(currentIndex, i) });
      }
      // Ajouter le break responsive
      rawSegments.push({ text: "", breakType: "responsive" });
      currentIndex = i + 1;
    } else if (processedTitle[i] === FORCE_BREAK_MARKER) {
      // Sauvegarder le texte avant le break
      if (i > currentIndex) {
        rawSegments.push({ text: processedTitle.slice(currentIndex, i) });
      }
      // Ajouter le break forcé
      rawSegments.push({ text: "", breakType: "force" });
      currentIndex = i + 1;
    }
  }

  // Ajouter le reste du texte
  if (currentIndex < processedTitle.length) {
    rawSegments.push({ text: processedTitle.slice(currentIndex) });
  }

  // Convertir les segments bruts en segments finaux avec emphasis
  for (const segment of rawSegments) {
    if (segment.breakType === "responsive") {
      segments.push({ type: "break-responsive", content: "" });
    } else if (segment.breakType === "force") {
      segments.push({ type: "break", content: "" });
    } else if (segment.text) {
      // Gérer l'emphasisText dans ce segment
      if (emphasisText && segment.text.includes(emphasisText)) {
        const emphasisIndex = segment.text.indexOf(emphasisText);
        const beforeEmphasis = segment.text.slice(0, emphasisIndex);
        const afterEmphasis = segment.text.slice(emphasisIndex + emphasisText.length);

        // Texte avant l'emphasis
        if (beforeEmphasis) {
          segments.push({ type: "text", content: beforeEmphasis });
        }

        // Texte en emphasis
        segments.push({ type: "emphasis", content: emphasisText });

        // Texte après l'emphasis
        if (afterEmphasis) {
          segments.push({ type: "text", content: afterEmphasis });
        }
      } else {
        // Texte normal sans emphasis
        segments.push({ type: "text", content: segment.text });
      }
    }
  }

  return segments;
}

"use client"

import { useMemo } from "react"
import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { TableField } from "./TableField"
import { SIZES, COLORS, TAGS } from "@/lib/blob-fields"
import fieldSections from "@/lib/blob-fields"
import { computeCompatibility, type OptionState } from "@/lib/use-blob-compatibility"
import { repeaterFieldToTableConfig, type TableLayoutConfig } from "@/lib/table-field-utils"

// ─── Button config derived from blob-fields ─────────────────────────────────

const buttonRepeater = fieldSections.buttons.fields.buttons
const buttonFields = buttonRepeater.type === "repeater" ? buttonRepeater.fields : {}

const BUTTON_LAYOUT: TableLayoutConfig = {
  inline: ["label"],
  groups: [
    {
      key: "link",
      label: "Lien",
      fields: ["linkType", "internalHref", "externalHref", "customAction", "opensInNewTab"],
    },
    {
      key: "style",
      label: "Style",
      fields: ["variant", "theme"],
    },
  ],
}

const { columns: BUTTON_COLUMNS, defaultRow: BUTTON_DEFAULT_ROW } =
  repeaterFieldToTableConfig(buttonFields, BUTTON_LAYOUT)

interface BlobInspectorProps {
  block: {
    id: string
    type: string
    props: Record<string, string | boolean>
  }
  onUpdateProp: (propName: string, value: string | boolean) => void
}

export function BlobInspector({ block, onUpdateProp }: BlobInspectorProps) {
  const { props } = block

  // Compatibility state — recomputed whenever props change (driven by Inspector’s
  // setSelectedBlock which is called for any structural prop change).
  const compat = useMemo(
    () => computeCompatibility(props as Record<string, unknown>),
    [props]
  )

  // Helper — merge French label overrides into compatibility-aware OptionState[].
  function withLabels(
    compatOpts: OptionState[],
    labelMap: Record<string, string>,
    prepend?: OptionState[]
  ): OptionState[] {
    const mapped = compatOpts.map((o) => ({
      ...o,
      label: labelMap[o.value] ?? o.label,
    }))
    return prepend ? [...prepend, ...mapped] : mapped
  }

  const markerPositionOptions = withLabels(compat.marker.options, {
    top: "Haut",
    left: "Gauche",
    right: "Droite",
  })

  const actionsCompatOptions = withLabels(
    compat.actions.options,
    { before: "Avant", after: "Après" },
    [{ value: "", label: "Par défaut", disabled: false }]
  )

  const alignOptions = withLabels(compat.align.options, {
    left: "Gauche",
    center: "Centré",
    right: "Droite",
  })

  // figureWidth: keep only fraction values + prepend "Par défaut"
  const FIGURE_FRACTIONS = new Set(["1/4", "1/3", "1/2", "2/3", "3/4"])
  const figureWidthOptions: OptionState[] = [
    { value: "", label: "Par défaut", disabled: false },
    ...compat.figureWidth.options.filter((o) => FIGURE_FRACTIONS.has(o.value)),
  ]

  // Helper to create options from array
  const arrayToOptions = (arr: readonly string[]) =>
    Object.fromEntries(arr.map((v) => [v, v]))

  return (
    <div>
      {/* Header */}
      <CollapsibleSection title="Textes" defaultOpen={true}>
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Titre"
            value={props.title as string}
            type="text"
            onChange={(v) => onUpdateProp("title", v)}
          />
          <InspectorField
            label="Sous-titre"
            value={props.subtitle as string}
            type="text"
            onChange={(v) => onUpdateProp("subtitle", v)}
          />
          <InspectorField
            label="Sur-titre"
            value={props.eyebrow as string}
            type="text"
            onChange={(v) => onUpdateProp("eyebrow", v)}
          />
          <InspectorField
            label="Texte en emphase"
            value={props.emphasisText as string}
            type="text"
            onChange={(v) => onUpdateProp("emphasisText", v)}
          />
          <InspectorField
            label="Thème du sur-titre"
            value={props.eyebrowTheme as string}
            type="select"
            options={arrayToOptions(COLORS)}
            onChange={(v) => onUpdateProp("eyebrowTheme", v)}
          />
        </div>
      </CollapsibleSection>

      {/* Marker */}
      <CollapsibleSection title="Marqueur">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Type"
            value={props.markerType as string}
            type="select"
            options={{ none: "Aucun", text: "Texte", icon: "Icône" }}
            onChange={(v) => onUpdateProp("markerType", v)}
          />
          {props.markerType === "text" && (
            <InspectorField
              label="Contenu"
              value={props.markerContent as string}
              type="text"
              onChange={(v) => onUpdateProp("markerContent", v)}
            />
          )}
          {props.markerType !== "none" && (
            <>
              <InspectorField
                label="Position"
                value={props.markerPosition as string}
                type="select"
                compatOptions={markerPositionOptions}
                onChange={(v) => onUpdateProp("markerPosition", v)}
              />
              <InspectorField
                label="Style"
                value={props.markerStyle as string}
                type="select"
                options={{
                  default: "Default",
                  ghost: "Transparent",
                  secondary: "Secondaire",
                }}
                onChange={(v) => onUpdateProp("markerStyle", v)}
              />
              <InspectorField
                label="Taille"
                value={props.markerSize as string}
                type="select"
                options={{ auto: "Auto", ...arrayToOptions(SIZES) }}
                onChange={(v) => onUpdateProp("markerSize", v)}
              />
              <InspectorField
                label="Couleur"
                value={props.markerTheme as string}
                type="select"
                options={arrayToOptions(COLORS)}
                onChange={(v) => onUpdateProp("markerTheme", v)}
              />
              <InspectorField
                label="Forme"
                value={props.markerRounded as string}
                type="select"
                options={{
                  "rounded-square": "Carré arrondi",
                  "rounded-full": "Rond",
                }}
                onChange={(v) => onUpdateProp("markerRounded", v)}
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Figure */}
      <CollapsibleSection title="Figure">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Type"
            value={props.figureType as string}
            type="select"
            options={{ none: "Aucune", image: "Image", video: "Vidéo" }}
            onChange={(v) => onUpdateProp("figureType", v)}
          />
          {props.figureType !== "none" && (
            <>
              {props.figureType === "image" && (
                <InspectorField
                  label="URL de l'image"
                  value={props.image as string}
                  type="text"
                  onChange={(v) => onUpdateProp("image", v)}
                />
              )}
              {props.figureType === "video" && (
                <InspectorField
                  label="URL de la vidéo"
                  value={props.video as string}
                  type="text"
                  onChange={(v) => onUpdateProp("video", v)}
                />
              )}
              <InspectorField
                label="Largeur"
                value={props.figureWidth as string}
                type="select"
                compatOptions={figureWidthOptions}
                disabled={compat.figureWidth.field.disabled}
                disabledReason={compat.figureWidth.field.reason}
                onChange={(v) => onUpdateProp("figureWidth", v)}
              />
              <InspectorField
                label="Débordement"
                value={props.figureBleed as string}
                type="select"
                options={{ none: "Aucun", full: "Complet" }}
                onChange={(v) => onUpdateProp("figureBleed", v)}
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Boutons */}
      <CollapsibleSection title="Boutons">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Position des actions"
            value={props.actions as string}
            type="select"
            compatOptions={actionsCompatOptions}
            disabled={compat.actions.field.disabled}
            disabledReason={compat.actions.field.reason}
            onChange={(v) => onUpdateProp("actions", v)}
          />
          <TableField
            value={props.buttons as string}
            columns={BUTTON_COLUMNS}
            defaultRow={BUTTON_DEFAULT_ROW}
            label="Gérer les boutons"
            title="Boutons"
            onChange={(v) => onUpdateProp("buttons", v)}
          />
        </div>
      </CollapsibleSection>

      {/* Content */}
      <CollapsibleSection title="Contenu">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Insérer du contenu"
            value={props.showContent as string}
            type="checkbox"
            onChange={(v) => onUpdateProp("showContent", v ? "true" : "false")}
          />
          {(props.showContent === true || props.showContent === "true") && (
            <>
              <InspectorField
                label="Type de contenu"
                value={props.contentType as string}
                type="select"
                options={{ text: "Texte", innerBlocks: "Blocs imbriqués" }}
                onChange={(v) => onUpdateProp("contentType", v)}
              />
              {props.contentType === "text" && (
                <>
                  <InspectorField
                    label="Texte"
                    value={props.contentText as string}
                    type="textarea"
                    onChange={(v) => onUpdateProp("contentText", v)}
                  />
                  <InspectorField
                    label="Taille de police"
                    value={props.fontSize as string}
                    type="select"
                    options={arrayToOptions(SIZES)}
                    onChange={(v) => onUpdateProp("fontSize", v)}
                  />
                </>
              )}
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Layout */}
      <CollapsibleSection title="Disposition">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Taille"
            value={props.size as string}
            type="select"
            options={arrayToOptions(SIZES)}
            onChange={(v) => onUpdateProp("size", v)}
          />
          <InspectorField
            label="Disposition"
            value={props.layout as string}
            type="select"
            options={{
              stack: "En pile",
              row: "En ligne",
              bar: "En barre",
            }}
            onChange={(v) => onUpdateProp("layout", v)}
          />
          <InspectorField
            label="Direction"
            value={props.direction as string}
            type="select"
            options={{ "": "Par défaut", reverse: "Inversé" }}
            onChange={(v) => onUpdateProp("direction", v)}
          />
          <InspectorField
            label="Alignement"
            value={props.align as string}
            type="select"
            compatOptions={alignOptions}
            onChange={(v) => onUpdateProp("align", v)}
          />
        </div>
      </CollapsibleSection>

      {/* Spacing */}
      <CollapsibleSection title="Espacement">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Espacement horizontal"
            value={props.paddingX as string}
            type="select"
            options={{ auto: "Auto", ...arrayToOptions(SIZES) }}
            onChange={(v) => onUpdateProp("paddingX", v)}
          />
          <InspectorField
            label="Espacement vertical"
            value={props.paddingY as string}
            type="select"
            options={{ auto: "Auto", ...arrayToOptions(SIZES) }}
            onChange={(v) => onUpdateProp("paddingY", v)}
          />
          <InspectorField
            label="Espacement interne"
            value={props.gutter as string}
            type="select"
            options={{ auto: "Auto", ...arrayToOptions(SIZES) }}
            onChange={(v) => onUpdateProp("gutter", v)}
          />
        </div>
      </CollapsibleSection>

      {/* Style */}
      <CollapsibleSection title="Style">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Apparence"
            value={props.appearance as string}
            type="select"
            options={{
              default: "Par défaut",
              card: "Carte",
              cardElevated: "Carte élevée",
              glassmorphism: "Glassmorphism",
              figma: "Figma",
              neoBrutalism: "Néo-Brutalisme",
              outlined: "Contour",
              minimal: "Minimal",
            }}
            onChange={(v) => onUpdateProp("appearance", v)}
          />
          <InspectorField
            label="Thème"
            value={props.theme as string}
            type="select"
            options={arrayToOptions(COLORS)}
            onChange={(v) => onUpdateProp("theme", v)}
          />
          <InspectorField
            label="Arrière-plan"
            value={props.backgroundType as string}
            type="select"
            options={{
              none: "Aucun",
              color: "Couleur",
              image: "Image",
              custom: "Personnalisé",
            }}
            onChange={(v) => onUpdateProp("backgroundType", v)}
          />
          {props.backgroundType === "color" && (
            <InspectorField
              label="Couleur d'arrière-plan"
              value={props.backgroundColor as string}
              type="select"
              options={arrayToOptions(COLORS)}
              onChange={(v) => onUpdateProp("backgroundColor", v)}
            />
          )}
        </div>
      </CollapsibleSection>

      {/* Séparateur */}
      <CollapsibleSection title="Séparateur">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Afficher un séparateur"
            value={props.showSeparator as string}
            type="checkbox"
            onChange={(v) => onUpdateProp("showSeparator", v ? "true" : "false")}
          />
          {(props.showSeparator === true || props.showSeparator === "true") && (
            <>
              <InspectorField
                label="Type"
                value={props.separatorType as string}
                type="select"
                options={{ line: "Ligne", dot: "Point", wave: "Vague" }}
                onChange={(v) => onUpdateProp("separatorType", v)}
              />
              <InspectorField
                label="Position"
                value={props.separatorPosition as string}
                type="select"
                options={{
                  afterTitle: "Après le titre",
                  afterSubtitle: "Après le sous-titre",
                }}
                onChange={(v) => onUpdateProp("separatorPosition", v)}
              />
              <InspectorField
                label="Couleur"
                value={props.separatorColor as string}
                type="select"
                options={arrayToOptions(COLORS)}
                onChange={(v) => onUpdateProp("separatorColor", v)}
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* SEO */}
      <CollapsibleSection title="SEO">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Balise du titre"
            value={props.titleAs as string}
            type="select"
            options={arrayToOptions(TAGS)}
            onChange={(v) => onUpdateProp("titleAs", v)}
          />
          <InspectorField
            label="Balise du sur-titre"
            value={props.eyebrowAs as string}
            type="select"
            options={arrayToOptions(TAGS)}
            onChange={(v) => onUpdateProp("eyebrowAs", v)}
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}

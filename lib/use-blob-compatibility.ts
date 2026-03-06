import { useMemo } from 'react';
import {
  COMPATIBILITY,
  resolveValid,
  type Layout,
  type Marker,
  type Action,
  type AlignValue,
  MARKERS,
  ACTIONS,
  ALIGNS,
  FIGURE_WIDTHS,
} from './blob-compatibility';

type FormData = Record<string, unknown>;

export type OptionState = {
  value: string;
  label: string;
  disabled: boolean;
  reason?: string;
};

export type FieldState = {
  visible: boolean;
  disabled: boolean;
  reason?: string;
};

export type CompatibilityState = {
  marker: {
    field: FieldState;
    options: OptionState[];
  };
  actions: {
    field: FieldState;
    options: OptionState[];
  };
  align: {
    field: FieldState;
    options: OptionState[];
  };
  figureWidth: {
    field: FieldState;
    options: OptionState[];
  };
};

/**
 * Hook qui calcule l'état de compatibilité de tous les champs
 * en fonction du layout et des valeurs actuelles du formulaire.
 */
export function useCompatibleOptions(formData: FormData): CompatibilityState {
  return useMemo(() => computeCompatibility(formData), [formData]);
}

/**
 * Calcule l'état de compatibilité (version non-hook pour usage dans callbacks)
 */
export function computeCompatibility(formData: FormData): CompatibilityState {
  const layout = (formData.layout as Layout) || 'stack';
  const direction = (formData.direction as string) || 'default';
  const compat = COMPATIBILITY[layout];

  // Contexte actuel pour les contraintes croisées
  const context = {
    marker: formData.markerPosition as Marker | undefined,
    actions: formData.actions as Action | undefined,
    align: formData.align as AlignValue | undefined,
  };

  // Affichage du layout pour les messages d'erreur
  const displayLayout = direction === "reverse" ? `${layout}-${direction}` : layout;

  // ─── MARKER ───────────────────────────────────────────────
  const markerOptions: OptionState[] = MARKERS.map((value) => {
    const isValid = compat.marker.includes(value);
    return {
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      disabled: !isValid,
      reason: !isValid
        ? `Position "${value}" incompatible avec layout "${displayLayout}"`
        : undefined,
    };
  });

  // ─── ACTIONS ──────────────────────────────────────────────
  const actionsSupported = !!compat.actions;
  const actionsOptions: OptionState[] = ACTIONS.map((value) => {
    const isValid = actionsSupported && compat.actions!.includes(value);
    return {
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      disabled: !isValid,
      reason: !isValid
        ? actionsSupported
          ? `Position "${value}" incompatible avec layout "${displayLayout}"`
          : `Actions non supportées sur layout "${displayLayout}"`
        : undefined,
    };
  });

  // ─── ALIGN ────────────────────────────────────────────────
  const validAligns = resolveValid(layout, 'align', context);
  const alignOptions: OptionState[] = ALIGNS.map((value) => {
    const isValid = validAligns.includes(value);
    let reason: string | undefined;

    if (!isValid) {
      if (!compat.align.includes(value)) {
        reason = `Alignement "${value}" incompatible avec layout "${displayLayout}"`;
      } else if (context.marker && ['left', 'right'].includes(context.marker)) {
        reason = `Alignement "${value}" incompatible avec marker "${context.marker}"`;
      }
    }

    return {
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      disabled: !isValid,
      reason,
    };
  });

  // ─── FIGURE WIDTH ─────────────────────────────────────────
  const figureWidthSupported = !!compat.figureWidth;
  const validFigureWidths = figureWidthSupported
    ? resolveValid(layout, 'figureWidth', context)
    : [];

  const figureWidthOptions: OptionState[] = FIGURE_WIDTHS.map((value) => {
    const isValid = figureWidthSupported && validFigureWidths.includes(value);
    return {
      value,
      label: value.toUpperCase(),
      disabled: !isValid,
      reason: !isValid
        ? `Figure width non supportée sur layout "${displayLayout}"`
        : undefined,
    };
  });

  return {
    marker: {
      field: { visible: true, disabled: false },
      options: markerOptions,
    },
    actions: {
      field: {
        visible: true,
        disabled: !actionsSupported,
        reason: !actionsSupported
          ? `Les actions ne sont pas supportées sur le layout "${displayLayout}"`
          : undefined,
      },
      options: actionsOptions,
    },
    align: {
      field: { visible: true, disabled: false },
      options: alignOptions,
    },
    figureWidth: {
      field: {
        visible: true,
        disabled: !figureWidthSupported,
        reason: !figureWidthSupported
          ? `La largeur de figure n'est pas supportée sur le layout "${displayLayout}"`
          : undefined,
      },
      options: figureWidthOptions,
    },
  };
}



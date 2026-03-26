"use client";

import React, { useState, useMemo } from "react";
import { IconData } from "@/lib/blob-fields";
import { useIconifySearch, useIconifyIcon } from "@/lib/iconify/hooks";
import { useDebounce } from "@/lib/iconify/utils";
import { renderIconObject } from "@/lib/render-icon";
import {
  ICONIFY_COLLECTIONS,
  DEFAULT_COLLECTION,
  ICONIFY_SEARCH_CONFIG,
} from "@/config/iconify-collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Loader2 } from "lucide-react";

interface IconifyPickerProps {
  value: IconData | null;
  onChange: (value: IconData | null) => void;
  showSizeControl?: boolean;
  showStrokeControl?: boolean;
  label?: string;
}

export function IconifyPicker({
  value,
  onChange,
  showSizeControl = true,
  showStrokeControl = true,
  label = "Icône",
}: IconifyPickerProps) {
  // Mode: "search" for browsing, "selected" for editing selected icon
  const [mode, setMode] = useState<"search" | "selected">(
    value ? "selected" : "search"
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [collection, setCollection] = useState(
    value?.collection || DEFAULT_COLLECTION
  );

  // Icon customization state
  const [iconSize, setIconSize] = useState(value?.metadata?.size || 24);
  const [strokeWidth, setStrokeWidth] = useState(
    value?.metadata?.strokeWidth || 2
  );

  // Debounced search
  const debouncedQuery = useDebounce(
    searchQuery,
    ICONIFY_SEARCH_CONFIG.debounceMs
  );

  // Search results
  const { results, loading: searchLoading } = useIconifySearch(
    debouncedQuery,
    collection,
    ICONIFY_SEARCH_CONFIG.maxResults
  );

  // Currently selected/hovered icon for preview
  const [previewIconName, setPreviewIconName] = useState<string | null>(null);
  const { iconData: previewIconData, loading: previewLoading } = useIconifyIcon(
    previewIconName,
    collection,
    iconSize,
    strokeWidth
  );

  // Handle icon selection from search results
  const handleSelectIcon = (iconName: string) => {
    setPreviewIconName(iconName);
  };

  // Confirm icon selection
  const handleConfirmSelection = () => {
    if (previewIconData) {
      onChange(previewIconData);
      setMode("selected");
      setSearchQuery("");
      setPreviewIconName(null);
    }
  };

  // Remove selected icon
  const handleRemoveIcon = () => {
    onChange(null);
    setMode("search");
    setSearchQuery("");
    setPreviewIconName(null);
  };

  // Update icon metadata (size/stroke) for already selected icon
  const handleUpdateMetadata = (
    newSize: number,
    newStrokeWidth: number
  ) => {
    if (value) {
      // Re-fetch icon with new parameters
      setIconSize(newSize);
      setStrokeWidth(newStrokeWidth);
      setPreviewIconName(value.name);
      setCollection(value.collection);
    }
  };

  // Apply updated metadata to selected icon
  React.useEffect(() => {
    if (mode === "selected" && previewIconData && value) {
      onChange(previewIconData);
    }
  }, [previewIconData, mode, value, onChange]);

  // Render selected icon mode
  if (mode === "selected" && value) {
    return (
      <div className="space-y-3">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>

        {/* Selected icon preview */}
        <div className="relative group">
          <div
            className="flex items-center justify-center w-full h-24 border rounded-md bg-muted/30 cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => setMode("search")}
          >
            <div className="w-12 h-12 text-foreground">
              {renderIconObject(value.iconObject)}
            </div>
          </div>

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveIcon();
            }}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer l'icône"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon name */}
        <div className="text-sm text-center text-muted-foreground">
          {value.collection}/{value.name}
        </div>

        {/* Size control */}
        {showSizeControl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Taille
              </Label>
              <span className="text-xs text-muted-foreground">{iconSize}px</span>
            </div>
            <Slider
              value={[iconSize]}
              onValueChange={([val]) =>
                handleUpdateMetadata(val, strokeWidth)
              }
              min={16}
              max={128}
              step={4}
              className="w-full"
            />
          </div>
        )}

        {/* Stroke width control */}
        {showStrokeControl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Épaisseur du trait
              </Label>
              <span className="text-xs text-muted-foreground">
                {strokeWidth}
              </span>
            </div>
            <Slider
              value={[strokeWidth * 10]}
              onValueChange={([val]) =>
                handleUpdateMetadata(iconSize, val / 10)
              }
              min={5}
              max={40}
              step={5}
              className="w-full"
            />
          </div>
        )}

        {/* Change button */}
        <Button
          variant="outline"
          className="w-full h-8 text-xs"
          onClick={() => setMode("search")}
        >
          Changer l'icône
        </Button>
      </div>
    );
  }

  // Render search mode
  return (
    <div className="space-y-3">
      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>

      {/* Collection selector */}
      <Select value={collection} onValueChange={setCollection}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Sélectionner une collection" />
        </SelectTrigger>
        <SelectContent>
          {ICONIFY_COLLECTIONS.map((col) => (
            <SelectItem key={col.id} value={col.id} className="text-xs">
              {col.name}
              {col.total && (
                <span className="text-muted-foreground ml-2">
                  ({col.total.toLocaleString()})
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher une icône..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs pl-7 pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Search results */}
      <div className="border rounded-md bg-muted/30">
        {/* Loading state */}
        {searchLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!searchLoading && !searchQuery && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            Tapez pour rechercher des icônes
          </div>
        )}

        {/* No results */}
        {!searchLoading && searchQuery && results.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            Aucune icône trouvée
          </div>
        )}

        {/* Results grid */}
        {!searchLoading && results.length > 0 && (
          <div className="grid grid-cols-6 gap-1 p-2 max-h-64 overflow-y-auto">
            {results.map((iconName) => (
              <button
                key={iconName}
                onClick={() => handleSelectIcon(iconName)}
                className={`
                  flex items-center justify-center w-full h-10 rounded border-2 transition-all
                  ${
                    previewIconName === iconName
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/50"
                  }
                `}
                title={iconName}
              >
                <IconPreview
                  iconName={iconName}
                  collection={collection}
                  size={20}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview and confirm */}
      {previewIconName && (
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-center w-full h-20 border rounded-md bg-muted/30">
            {previewLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              previewIconData && (
                <div className="w-10 h-10 text-foreground">
                  {renderIconObject(previewIconData.iconObject)}
                </div>
              )
            )}
          </div>

          <div className="text-xs text-center text-muted-foreground">
            {collection}/{previewIconName}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={() => setPreviewIconName(null)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 h-8 text-xs"
              onClick={handleConfirmSelection}
              disabled={!previewIconData}
            >
              Sélectionner
            </Button>
          </div>
        </div>
      )}

      {/* Cancel button (if icon already selected) */}
      {value && (
        <Button
          variant="ghost"
          className="w-full h-8 text-xs"
          onClick={() => setMode("selected")}
        >
          Annuler
        </Button>
      )}
    </div>
  );
}

/**
 * Small icon preview component for grid
 * Fetches and displays icon at small size
 */
function IconPreview({
  iconName,
  collection,
  size,
}: {
  iconName: string;
  collection: string;
  size: number;
}) {
  const { iconData, loading, error } = useIconifyIcon(iconName, collection, size, 2);

  if (loading) {
    return <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />;
  }

  if (error || !iconData) {
    // Silent failure - show empty state instead of red square in production
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-foreground">
      <div className="w-5 h-5 flex-shrink-0" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {renderIconObject(iconData.iconObject)}
      </div>
    </div>
  );
}

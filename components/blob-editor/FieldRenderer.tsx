"use client";

import React, { useState } from "react";
import { type Field, type IconObject, type ShowIfCondition } from "@/lib/blob-fields";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ImageIcon, VideoIcon, Plus, Trash2, GripVertical, Check, ChevronsUpDown, X } from "lucide-react";
import { type OptionState } from "@/lib/use-blob-compatibility";
import { type FormDataValue } from "@/types/editor";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── renderIconObject ────────────────────────────────────────────────────────

export const renderIconObject = (iconObj: IconObject): React.ReactElement | null => {
  if (!iconObj) return null;

  const { type, props } = iconObj;
  const { children, ...otherProps } = props;

  const defaultProps: Record<string, string | number> = {};

  if (type === 'svg') {
    defaultProps.xmlns = 'http://www.w3.org/2000/svg';
  }

  if (type === 'path' || type === 'circle' || type === 'rect' || type === 'line') {
    if (!otherProps.fill) defaultProps.fill = 'none';
    if (!otherProps.stroke) defaultProps.stroke = 'currentColor';
    if (!otherProps.strokeLinecap) defaultProps.strokeLinecap = 'round';
    if (!otherProps.strokeLinejoin) defaultProps.strokeLinejoin = 'round';
  }

  const Element = type as keyof React.JSX.IntrinsicElements;

  return React.createElement(
    Element,
    { ...defaultProps, ...otherProps } as React.HTMLAttributes<HTMLElement>,
    children?.map((child, index) => {
      const element = renderIconObject(child);
      return element ? React.cloneElement(element, { key: index }) : null;
    })
  );
};

// ─── shouldShow ──────────────────────────────────────────────────────────────

function evaluateCondition(condition: ShowIfCondition, context: Record<string, unknown>): boolean {
  const { field: targetField, value: targetValue } = condition;
  const actualValue = context[targetField];

  // Gestion de la logique inverse (préfixe "!")
  // Utilisé pour masquer/afficher les champs selon itemFields
  if (typeof targetValue === 'string' && targetValue.startsWith('!')) {
    const key = targetValue.substring(1);
    if (Array.isArray(actualValue)) {
      return !actualValue.includes(key);
    }
    return actualValue !== key;
  }

  // Vérifier si une valeur est contenue dans un tableau (ex: "title" in itemFields)
  if (typeof targetValue === 'string' && Array.isArray(actualValue)) {
    return actualValue.includes(targetValue);
  }

  if (Array.isArray(targetValue)) {
    return typeof actualValue === 'string' && targetValue.includes(actualValue);
  }
  return actualValue === targetValue;
}

export const shouldShow = (field: Field, context: Record<string, unknown>): boolean => {
  if (!field.showIf) return true;

  // Support composite showIf (AND logic): all conditions must pass
  if (Array.isArray(field.showIf)) {
    return field.showIf.every((condition) => evaluateCondition(condition, context));
  }

  return evaluateCondition(field.showIf, context);
};

// ─── ImageField ──────────────────────────────────────────────────────────────

export const ImageField = ({
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: FormDataValue | undefined;
  onChange: (val: FormDataValue) => void;
}) => {
  const [tempUrl, setTempUrl] = useState((value as string) || "");

  return (
    <div className="space-y-1.5 px-1 py-1">
      <Label className="text-[11px] uppercase text-gray-700 font-semibold">{label}</Label>
      {value ? (
        <div className="relative group">
          <div className="aspect-video bg-gray-100 border rounded-md overflow-hidden flex items-center justify-center">
            {typeof value === 'string' && (value.startsWith('http') || value.startsWith('/')) ? (
              <Image src={value} alt="" width={600} height={338} className="w-full h-full object-cover" />
            ) : (
              <div className="text-[10px] text-gray-400 break-all p-2 text-center">
                <ImageIcon className="h-4 w-4 mx-auto mb-1 opacity-20" />
                {value as string}
              </div>
            )}
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => { onChange(""); setTempUrl(""); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="aspect-video bg-gray-100 border border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
            <ImageIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-[10px] text-gray-500">Choisir une image</span>
          </div>
          <div className="flex gap-1">
            <Input
              placeholder="URL de l'image..."
              className="h-7 text-[10px] border-gray-400 rounded-xs flex-1"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onChange(tempUrl)}
            />
            <Button className="h-7 px-2 text-[10px] rounded-xs" onClick={() => onChange(tempUrl)}>OK</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── VideoField ──────────────────────────────────────────────────────────────

export const VideoField = ({
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: FormDataValue | undefined;
  onChange: (val: FormDataValue) => void;
}) => {
  const [tempVideoUrl, setTempVideoUrl] = useState((value as string) || "");

  return (
    <div className="space-y-1.5 px-1 py-1">
      <Label className="text-[11px] uppercase text-gray-700 font-semibold">{label}</Label>
      {value ? (
        <div className="relative group">
          <div className="aspect-video bg-black/90 border rounded-md overflow-hidden flex flex-col items-center justify-center text-white/60">
            <VideoIcon className="h-6 w-6 mb-1 opacity-40" />
            <div className="text-[10px] break-all px-4 text-center">{value as string}</div>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => { onChange(""); setTempVideoUrl(""); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="aspect-video bg-gray-100 border border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
            <VideoIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-[10px] text-gray-500">Choisir une vidéo</span>
          </div>
          <div className="flex gap-1">
            <Input
              placeholder="URL de la vidéo..."
              className="h-7 text-[10px] border-gray-400 rounded-xs flex-1"
              value={tempVideoUrl}
              onChange={(e) => setTempVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onChange(tempVideoUrl)}
            />
            <Button className="h-7 px-2 text-[10px] rounded-xs" onClick={() => onChange(tempVideoUrl)}>OK</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── IconFieldComponent ──────────────────────────────────────────────────────

export const IconFieldComponent = ({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: FormDataValue | undefined;
  onChange: (val: FormDataValue) => void;
  options: Record<string, { name: string; collection: string; metadata: { size: number; strokeWidth: number }; iconObject: IconObject }>;
}) => {
  const selectedIconKey = typeof value === 'string' ? value : undefined;
  const selectedIcon = selectedIconKey ? options[selectedIconKey] : undefined;

  return (
    <div className="space-y-1.5 px-1 py-1">
      <Label htmlFor={id} className="text-[11px] uppercase text-gray-700 font-semibold">{label}</Label>
      <Select value={selectedIconKey || ""} onValueChange={(val) => onChange(val)}>
        <SelectTrigger id={id} className="h-8 text-xs w-full border-gray-400 rounded-xs">
          <SelectValue placeholder="Choisir...">
            {selectedIcon && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3">{renderIconObject(selectedIcon.iconObject)}</div>
                <span>{selectedIcon.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(options).map(([key, iconData]) => (
            <SelectItem key={key} value={key} className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3">{renderIconObject(iconData.iconObject)}</div>
                <span>{iconData.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// ─── MultiSelectField (extracted to avoid conditional hooks) ─────────────────

const MultiSelectField = ({
  field,
  value,
  onChange,
}: {
  id: string;
  field: Field & { type: "multiselect" };
  value: FormDataValue | undefined;
  onChange: (val: FormDataValue) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selectedValues = (value as string[]) || [];

  // Filtrer les sections (non sélectionnables)
  const isSectionHeader = (key: string) => key.startsWith("section:");

  const toggleValue = (val: string) => {
    if (isSectionHeader(val)) return; // Ignorer les clics sur les sections
    const newValues = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    onChange(newValues);
  };

  const removeValue = (val: string) => {
    onChange(selectedValues.filter((v) => v !== val));
  };

  // Ne compter que les vraies valeurs (pas les sections)
  const actualSelectedValues = selectedValues.filter(v => !isSectionHeader(v));

  return (
    <div className="space-y-1.5 px-1 py-1">
      <Label className="text-[11px] uppercase text-gray-700 font-semibold">{field.label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-8 text-xs border-gray-400 rounded-xs hover:bg-transparent"
          >
            <div className="flex flex-wrap gap-1">
              {actualSelectedValues.length === 0 ? (
                <span className="text-muted-foreground">Sélectionner...</span>
              ) : (
                actualSelectedValues.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-xs text-[10px] font-medium"
                  >
                    {((field.options[val] as string | undefined) ?? val).replace(/^\s*↳\s*/, "")}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(val);
                      }}
                    />
                  </span>
                ))
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher..." className="h-8 text-xs" />
            <CommandEmpty className="py-6 text-xs text-center text-muted-foreground">
              Aucun résultat
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {Object.entries(field.options).map(([val, label]) => {
                const isSection = isSectionHeader(val);

                if (isSection) {
                  // Rendu spécial pour les sections (non cliquables)
                  return (
                    <div
                      key={val}
                      className="px-2 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide pointer-events-none"
                    >
                      {label as string}
                    </div>
                  );
                }

                return (
                  <CommandItem
                    key={val}
                    value={val}
                    onSelect={() => toggleValue(val)}
                    className="text-xs"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-xs border border-primary",
                        selectedValues.includes(val)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    {label as string}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// ─── RenderField ─────────────────────────────────────────────────────────────

export const RenderField = ({
  id,
  field,
  value,
  onChange,
  context,
  compatibleOptions,
}: {
  id: string;
  field: Field;
  value: FormDataValue | undefined;
  onChange: (val: FormDataValue) => void;
  context: Record<string, unknown>;
  compatibleOptions?: OptionState[];
}) => {
  if (!shouldShow(field, context)) return null;

  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1.5 px-1 py-1">
          <Label htmlFor={id} className="text-[11px] uppercase text-gray-700 font-semibold">{field.label}</Label>
          <Input
            id={id}
            className="h-8 text-xs border-gray-400 rounded-xs"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1.5 px-1 py-1">
          <Label htmlFor={id} className="text-[11px] uppercase text-gray-700 font-semibold">{field.label}</Label>
          <Textarea
            id={id}
            className="text-xs border-gray-400 rounded-xs resize-none"
            rows={field.rows || 4}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Votre contenu ici..."
          />
        </div>
      );

    case "dropdown":
      return (
        <div className="space-y-1.5 px-1 py-1">
          <Label htmlFor={id} className="text-[11px] uppercase text-gray-700 font-semibold">{field.label}</Label>
          <Select value={(value as string) || ""} onValueChange={(val) => onChange(val)}>
            <SelectTrigger id={id} className="h-8 text-xs w-full border-gray-400 rounded-xs">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {compatibleOptions ? (
                compatibleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs" disabled={opt.disabled}>
                    <div className="flex flex-col gap-0.5 w-full">
                      <span className={opt.disabled ? "opacity-50" : ""}>{opt.label}</span>
                      {opt.disabled && opt.reason && (
                        <span className="text-[9px] text-amber-600 leading-tight">{opt.reason}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                Object.entries(field.options).map(([val, optLabel]) => (
                  <SelectItem key={val} value={val} className="text-xs">
                    {optLabel as string}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center space-x-2 px-1 py-2">
          <Checkbox
            id={id}
            checked={!!value}
            onCheckedChange={(val) => onChange(!!val)}
            className="border-gray-400 rounded-xs"
          />
          <Label htmlFor={id} className="text-xs text-gray-700 cursor-pointer">{field.label}</Label>
        </div>
      );

    case "multiselect":
      return <MultiSelectField id={id} field={field} value={value} onChange={onChange} />;

    case "repeater": {
      const items = (value as Array<Record<string, FormDataValue>>) || [];

      const addItem = () => onChange([...items, {}]);
      const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
      };
      const updateItemField = (index: number, childId: string, val: FormDataValue) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [childId]: val };
        onChange(newItems);
      };

      return (
        <div className="space-y-3 mt-4 border-t pt-4">
          <div className="flex items-center justify-between px-1">
            <Label className="text-[11px] uppercase text-gray-700 font-bold">{field.label}</Label>
            <Button variant="outline" size="sm" onClick={addItem} className="h-7 px-2 text-[10px] border-gray-400 rounded-xs">
              <Plus className="h-3 w-3 mr-1" /> Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => {
              // Merge parent context into item context so that showIf conditions
              // referencing parent-level fields (like itemFields) work correctly
              const itemContext = { ...context, ...item };

              return (
                <div key={index} className="border border-gray-200 rounded-xs bg-gray-50/30 overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-100 px-2 py-1 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3 w-3 text-gray-400 cursor-grab" />
                      <span className="text-[10px] font-medium text-gray-500">#{index + 1}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-red-500" onClick={() => removeItem(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-2 space-y-2">
                    {Object.entries(field.fields).map(([childId, childField]) => (
                      <RenderField
                        key={childId}
                        id={`${id}-${index}-${childId}`}
                        field={childField}
                        value={item[childId]}
                        onChange={(val) => updateItemField(index, childId, val)}
                        context={itemContext}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="text-[10px] text-gray-400 italic text-center py-4 border border-dashed border-gray-300 rounded-xs">
                Aucun {field.label.toLowerCase()} pour le moment
              </div>
            )}
          </div>
        </div>
      );
    }

    case "icon":
      return <IconFieldComponent id={id} label={field.label} value={value} onChange={onChange} options={field.options} />;
    case "image":
      return <ImageField id={id} label={field.label} value={value} onChange={onChange} />;
    case "video":
      return <VideoField id={id} label={field.label} value={value} onChange={onChange} />;
    case "innerBlocks":
      // Les innerBlocks sont gérés dans l'arborescence de l'éditeur, pas dans le formulaire
      return (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xs">
          <Label className="text-xs text-blue-700">{field.label}</Label>
          <p className="text-[10px] text-blue-600 mt-1">
            Les blocs imbriqués sont gérés dans l’arborescence de l’éditeur (sidebar gauche).
          </p>
        </div>
      );
    default:
      return null;
  }
};

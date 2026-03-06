"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RenderField, shouldShow } from "./FieldRenderer";
import { type FormDataValue } from "@/types/editor";
import { type useCompatibleOptions, type OptionState } from "@/lib/use-blob-compatibility";
import { type FieldSection } from "@/lib/blob-fields";

type Compatibility = ReturnType<typeof useCompatibleOptions>;

interface PresetItem { id: string; label: string; }

interface ControlsSidebarProps {
  sections: Record<string, FieldSection>;
  presets: PresetItem[];
  formData: Record<string, FormDataValue>;
  onUpdateField: (id: string, val: FormDataValue) => void;
  onQuickFill: (preset: string) => void;
  onClear: () => void;
  compatibility: Compatibility | undefined;
}

export function ControlsSidebar({
  sections,
  presets,
  formData,
  onUpdateField,
  onQuickFill,
  onClear,
  compatibility,
}: ControlsSidebarProps) {
  return (
    <div className="w-80 h-full bg-white p-4 flex flex-col overflow-y-auto">
      {/* Générateur de contenu rapide */}
      <div className="space-y-2 pb-4 mb-4 border-b border-gray-200">
        <Label className="text-[11px] uppercase text-gray-700 font-semibold">Contenu rapide</Label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map(({ id, label }) => (
            <Button
              key={id}
              size="sm"
              variant="outline"
              className="h-8 text-[10px] rounded-xs"
              onClick={() => onQuickFill(id)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-[10px] w-full" onClick={onClear}>
          Effacer tout
        </Button>
      </div>

      {/* Accordion des champs */}
      <Accordion type="multiple" className="w-full">
        {Object.entries(sections).map(([sectionId, section]) => {
          // Masquer la section si aucun champ n'est visible
          const hasVisibleFields = Object.values(section.fields).some(
            (field) => shouldShow(field, formData)
          );
          if (!hasVisibleFields) return null;

          return (
            <AccordionItem key={sectionId} value={sectionId} className="border-b">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                {section.label}
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 space-y-3">
                {Object.entries(section.fields).map(([fieldId, field]) => {
                  let compatOptions: OptionState[] | undefined;
                  if (compatibility) {
                    if (fieldId === "markerPosition") compatOptions = compatibility.marker.options;
                    else if (fieldId === "actions") compatOptions = compatibility.actions.options;
                    else if (fieldId === "align") compatOptions = compatibility.align.options;
                    else if (fieldId === "figureWidth") compatOptions = compatibility.figureWidth.options;
                  }

                  return (
                    <RenderField
                      key={fieldId}
                      id={fieldId}
                      field={field}
                      value={formData[fieldId]}
                      onChange={(val) => onUpdateField(fieldId, val)}
                      context={formData}
                      compatibleOptions={compatOptions}
                    />
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

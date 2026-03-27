"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getSectorsWithData } from "@/lib/self-assessment/sector-data";
import { useRouter } from "next/navigation";

interface SectorNavigationProps {
  currentSectorId: string;
}

export function SectorNavigation({ currentSectorId }: SectorNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const sectorsWithData = getSectorsWithData();

  const currentSector = sectorsWithData.find(s => s.id === currentSectorId);

  const handleSectorChange = (sectorId: string) => {
    router.push(`/self-assessment-report?sector=${sectorId}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-border rounded-lg shadow-sm hover:bg-white transition-all text-sm"
        >
          <span className="text-muted-foreground">Sector:</span>
          <span className="font-medium">{currentSector?.label || "Unknown"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-border rounded-lg shadow-lg z-40">
              <div className="p-2 space-y-1">
                {sectorsWithData
                  .sort((a, b) => b.sum - a.sum) // Sort by score descending
                  .map((sector) => (
                    <button
                      key={sector.id}
                      onClick={() => handleSectorChange(sector.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        sector.id === currentSectorId
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{sector.label}</span>
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded ${
                            sector.id === currentSectorId
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {sector.sum}%
                        </span>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Footer */}
              <div className="border-t p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  {sectorsWithData.length} sectors with data available
                </p>
              </div>
            </div>
          </>
        )}
    </div>
  );
}

"use client"

import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LayoutTemplate, Braces, Eye } from "lucide-react"

export type EditorView = "visual" | "json"

const VIEWS: { id: EditorView; icon: React.ElementType; label: string }[] = [
  { id: "visual", icon: LayoutTemplate, label: "Éditeur visuel" },
  { id: "json", icon: Braces, label: "Éditeur JSON" },
]

interface NewEditorSidebarProps {
  activeView: EditorView
  onViewChange: (view: EditorView) => void
  currentPage?: string | null
}

export function NewEditorSidebar({ activeView, onViewChange, currentPage }: NewEditorSidebarProps) {
  return (
    <div className="fixed w-11 h-full flex-shrink-0 bg-gray-100 border-r border-gray-200 flex flex-col items-center pt-2 gap-1">
      <TooltipProvider delayDuration={300}>
        {VIEWS.map(({ id, icon: Icon, label }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onViewChange(id)}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                  activeView === id
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                }`}
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}

        {currentPage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/${currentPage}`}
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                aria-label="Voir le rendu public"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Voir le rendu
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  )
}
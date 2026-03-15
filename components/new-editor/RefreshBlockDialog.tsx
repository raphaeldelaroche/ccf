"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RefreshCw, Sparkles } from "lucide-react"
import type { RefreshMode } from "@/lib/new-editor/refresh-helpers"

interface RefreshBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (mode: RefreshMode) => void
  blockType: string
}

export function RefreshBlockDialog({
  open,
  onOpenChange,
  onConfirm,
  blockType,
}: RefreshBlockDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Nettoyer le bloc
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left">
            Ce bloc contient peut-être des champs orphelins issus de l’ancienne
            structure de données (avant la migration responsive).

          </AlertDialogDescription>
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">
                    Nettoyage automatique
                  </p>
                  <p className="text-sm">
                    Cette opération va supprimer les champs responsive orphelins
                    qui traînent à la racine du bloc :
                  </p>
                  <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                    <li>Layout (layout, size, align, direction)</li>
                    <li>Spacing (paddingX, paddingY, gapX, gapY...)</li>
                    <li>Position (marker, actions, figureWidth...)</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    ✅ Ces champs seront conservés dans <code className="bg-muted px-1 rounded">responsive.base</code>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ✅ Tout le contenu (textes, médias, boutons) est préservé
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ✅ L’opération est récursive (innerBlocks + Iterator items)
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Type de bloc : <code className="bg-muted px-1 py-0.5 rounded">{blockType}</code>
            </p>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm('clean')
              onOpenChange(false)
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Nettoyer le bloc
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

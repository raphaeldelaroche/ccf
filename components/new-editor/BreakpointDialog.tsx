"use client"

import { useState } from "react"
import { BREAKPOINTS, type Breakpoint } from "@/lib/responsive-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface BreakpointDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (selectedBreakpoints: Breakpoint[]) => void
  onCancel: () => void
}

export function BreakpointDialog({
  open,
  onOpenChange,
  onApply,
  onCancel,
}: BreakpointDialogProps) {
  const [selected, setSelected] = useState<Set<Breakpoint>>(new Set())

  const handleToggle = (breakpoint: Breakpoint) => {
    const newSelected = new Set(selected)
    if (newSelected.has(breakpoint)) {
      newSelected.delete(breakpoint)
    } else {
      newSelected.add(breakpoint)
    }
    setSelected(newSelected)
  }

  const handleApply = () => {
    onApply(Array.from(selected))
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel()
    setSelected(new Set())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Appliquer les valeurs responsive</DialogTitle>
          <DialogDescription>
            Sélectionnez les breakpoints auxquels appliquer vos valeurs responsive avant de
            désactiver le mode responsive.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {BREAKPOINTS.map((breakpoint) => (
            <div key={breakpoint} className="flex items-center space-x-2">
              <Checkbox
                id={breakpoint}
                checked={selected.has(breakpoint)}
                onCheckedChange={() => handleToggle(breakpoint)}
              />
              <Label
                htmlFor={breakpoint}
                className="text-sm font-normal cursor-pointer"
              >
                {breakpoint}
              </Label>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleApply} disabled={selected.size === 0}>
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

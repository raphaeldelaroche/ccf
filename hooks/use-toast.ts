/**
 * Simple toast hook for notifications
 */

import { useCallback } from "react"

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = "default" }: ToastProps) => {
    // Pour l'instant, on utilise console.log
    // Dans une vraie implémentation, on utiliserait un système de notifications
    const emoji = variant === "destructive" ? "❌" : "✅"
    console.log(`${emoji} ${title}${description ? `: ${description}` : ""}`)

    // Optionnel : utiliser alert pour les erreurs critiques
    if (variant === "destructive") {
      // alert(`${title}\n${description || ""}`)
    }
  }, [])

  return { toast }
}

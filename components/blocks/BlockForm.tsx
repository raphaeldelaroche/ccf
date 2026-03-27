"use client"

import GravityForm from '@packages/package-form'
import { AlertCircle } from 'lucide-react'

/**
 * Composant BlockForm
 * Affiche un formulaire Gravity Forms configurable
 */
export interface BlockFormProps {
  formId: number
  successMessage?: string
  debug?: boolean
}

export function BlockForm({ formId, successMessage, debug = false }: BlockFormProps) {
  // Validation du formId
  if (!formId || formId < 1) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 border border-yellow-200 bg-yellow-50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-900">Configuration requise</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Veuillez configurer l&apos;ID du formulaire Gravity Forms dans l&apos;inspecteur.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <GravityForm
        id={formId}
        successMessage={successMessage}
        debug={debug}
      />
    </div>
  )
}

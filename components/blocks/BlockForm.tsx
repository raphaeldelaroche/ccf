import { cn } from '@/lib/utils'

/**
 * Composant BlockForm
 * Affiche un skeleton statique de formulaire de contact
 * Aucune configuration nécessaire - bloc purement visuel
 */
export function BlockForm() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">

        {/* Formulaire skeleton */}
        <form className="space-y-4">
          {/* Champ Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Votre nom complet"
              className={cn(
                "w-full px-4 py-3 border rounded-sm",
                "bg-white text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-gray-200",
                "placeholder:text-gray-400"
              )}
            />
          </div>

          {/* Champ Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="votre.email@exemple.com"
              className={cn(
                "w-full px-4 py-3 border rounded-sm",
                "bg-white text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-gray-200",
                "placeholder:text-gray-400"
              )}
            />
          </div>

          {/* Champ Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              placeholder="+33 6 12 34 56 78"
              className={cn(
                "w-full px-4 py-3 border rounded-sm",
                "bg-white text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-gray-200",
                "placeholder:text-gray-400"
              )}
            />
          </div>

          {/* Champ Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Votre message..."
              rows={5}
              className={cn(
                "w-full px-4 py-3 border rounded-sm",
                "bg-white text-gray-400 resize-none",
                "focus:outline-none focus:ring-2 focus:ring-gray-200",
                "placeholder:text-gray-400"
              )}
            />
          </div>

          {/* Bouton Submit */}
          <div className="pt-2">
            <button
              type="button"
              className={cn(
                "w-full px-6 py-3 rounded-lg font-medium",
                "bg-gray-300 text-gray-500",
                "transition-colors"
              )}
            >
              Envoyer
            </button>
          </div>
        </form>

        {/* Note */}
        <p className="text-xs text-center text-gray-400 mt-6">
          * Champs obligatoires
        </p>
      </div>
    </div>
  )
}

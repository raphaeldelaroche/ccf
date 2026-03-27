'use client';

import { FormPagination } from '../types';

interface FormProgressIndicatorProps {
  currentPage: number;
  totalPages: number;
  pagination: FormPagination | null;
  pageLabels?: string[];
  progressPercentage?: number;
}

const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({
  currentPage,
  totalPages,
  pagination,
  pageLabels = []
}) => {
  // Si pas de pagination ou si c'est un formulaire à une seule page, ne rien afficher
  if (!pagination || totalPages <= 1) {
    return null;
  }

  const { type, backgroundColor, color } = pagination;

  // Calcul du pourcentage de progression
  const progressPercentage = Math.floor((currentPage / totalPages) * 100);

  // Style pour la barre de progression
  const progressStyle = {
    backgroundColor: backgroundColor || undefined,
    color: color || undefined
  };

  // Style pour le remplissage de la barre de progression
  const fillStyle = {
    width: `${progressPercentage}%`,
    backgroundColor: color || '#3B82F6', // Bleu par défaut
  };

  // Affichage selon le type de pagination
  switch (type) {
    case 'percentage':
      return (
        <div className="mb-6 space-y-2">
          <div 
            className="w-full bg-gray-200 rounded-full h-2"
            style={progressStyle}
          >
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={fillStyle}
            ></div>
          </div>
          <div className="text-right text-sm text-gray-600">
            {progressPercentage}% {pagination.progressbar_completion_text || 'complété'}
          </div>
        </div>
      );

    case 'steps':
      return (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const isActive = pageNumber === currentPage;
              const isPast = pageNumber < currentPage;

              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    {/* Ligne de connexion */}
                    {index < totalPages - 1 && (
                      <div className="absolute left-1/2 top-1/2 h-0.5 w-12 md:w-24 lg:w-32 -translate-y-1/2">
                        <div 
                          className={`h-full transition-colors ${isPast ? 'bg-blue-600' : 'bg-gray-300'}`}
                          style={isPast ? { backgroundColor: color || undefined } : undefined}
                        ></div>
                      </div>
                    )}
                    
                    {/* Cercle de l'étape */}
                    <div 
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : isPast 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-300 text-gray-600'
                      }`}
                      style={isActive || isPast ? { backgroundColor: color || undefined } : undefined}
                    >
                      {pageNumber}
                    </div>
                  </div>
                  
                  {/* Label de l'étape */}
                  {pageLabels[index] && (
                    <span className={`mt-2 text-xs ${isActive ? 'font-medium' : ''}`}>
                      {pageLabels[index]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'pages':
      // Pagination simple avec indicateur de page
      return (
        <div className="mb-6 text-center">
          <span className="px-3 py-1 bg-gray-100 rounded-md text-sm">
            {currentPage} / {totalPages}
          </span>
        </div>
      );
      
    default:
      return null;
  }
};

export default FormProgressIndicator;
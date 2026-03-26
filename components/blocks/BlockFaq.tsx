import { MappedFaqData } from '@/lib/faq-mapper'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

interface BlockFaqProps {
  data: MappedFaqData
}

/**
 * Composant BlockFaq
 * Affiche une liste de questions/réponses dans un accordion avec un design aéré
 */
export function BlockFaq({ data }: BlockFaqProps) {
  const { faqItems, accordionType, collapsible, spacing } = data

  // Map spacing values to Tailwind padding classes
  const spacingMap: Record<string, string> = {
    none: 'p-0',
    sm: 'px-4 py-6',
    md: 'px-6 py-8',
    lg: 'px-8 py-10',
    xl: 'px-12 py-16',
  }

  const containerClasses = cn(
    'w-full max-w-full',
    spacingMap[spacing] || 'px-6 py-8'
  )

  if (faqItems.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
        Aucune question configurée
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <Accordion
        type={accordionType}
        collapsible={collapsible}
        className="w-full space-y-0"
      >
        {faqItems.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border-b border-gray-200 last:border-b-0"
          >
            <AccordionTrigger className="text-left py-6 hover:no-underline group">
              <span className="text-lg font-semibold text-gray-900 pr-8 leading-relaxed group-hover:text-gray-700 transition-colors">
                {item.question || `Question ${index + 1}`}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-0">
              <div className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap max-w-4xl">
                {item.answer || 'Réponse non fournie'}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

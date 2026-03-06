import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { parseTitleWithBreaks } from "@/lib/parse-title-breaks"

interface TitleProps extends Omit<React.ComponentProps<"h2">, "children"> {
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  asChild?: boolean
  children: React.ReactNode | string
  emphasisText?: string
}

function Title({
  className,
  as = "h2",
  asChild = false,
  children,
  emphasisText,
  ...props
}: TitleProps) {
  const Comp = asChild ? Slot : as

  // Si children est un string et qu'on a potentiellement du parsing à faire
  const shouldParse = typeof children === "string";

  const content = shouldParse
    ? renderParsedTitle(children as string, emphasisText)
    : children;

  return (
    <Comp
      data-slot="title"
      className={cn(
        "text-heading leading-heading mb-heading-bottom",
        "font-bold tracking-tight text-pretty text-foreground",
        className
      )}
      {...props}
    >
      {content}
    </Comp>
  )
}

/**
 * Rend un titre parsé avec les sauts de ligne et l'emphasis
 */
function renderParsedTitle(title: string, emphasisText?: string): React.ReactNode {
  const segments = parseTitleWithBreaks(title, emphasisText);

  return segments.map((segment, index) => {
    switch (segment.type) {
      case "break-responsive":
        // Responsive break: espace sur mobile, <br> sur desktop
        return (
          <React.Fragment key={index}>
            <span className="md:hidden"> </span>
            <br className="hidden md:block" />
          </React.Fragment>
        );

      case "break":
        // Force break: <br> partout
        return <br key={index} />;

      case "emphasis":
        // Texte en surbrillance
        return (
          <mark key={index} className="bg-gray-200">
            {segment.content}
          </mark>
        );

      case "text":
      default:
        // Texte normal
        return <React.Fragment key={index}>{segment.content}</React.Fragment>;
    }
  });
}

export { Title }

import { Blob, BlobHeader, BlobActions } from "@/components/blob/blob";
import { Title } from "@/components/blob/title";
import { Subtitle } from "@/components/blob/subtitle";
import { Eyebrow } from "@/components/blob/eyebrow";
import { BlobBackground } from "@/components/blob/blob-background";
import { resolveBackgrounds } from "@/config/blob-backgrounds";
import { resolveAppearances } from "@/config/blob-appearances";
import { cn } from "@/lib/utils";
import { Marker } from "../blob/marker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SelfAssessmentIntroProps {
  stepNumber?: string | number;
  markerIcon?: LucideIcon;
  title: string;
  subtitle: ReactNode;
  eyebrow?: ReactNode;
  emphasisText?: string;
  titleAs?: "div" | "h1";
  style?: "active" | "disabled";
  buttonLabel?: string;
  buttonHref?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "secondary";
  buttonTheme?: string;
  appearance?: string | string[];
  background?: string | string[];
}

export function SelfAssessmentIntro({
  stepNumber,
  markerIcon: MarkerIcon,
  title,
  subtitle,
  eyebrow,
  emphasisText,
  titleAs = "h1",
  style = "active",
  buttonLabel,
  buttonHref,
  buttonVariant = "default",
  buttonTheme,
  appearance,
  background
}: SelfAssessmentIntroProps) {
  const step = stepNumber ? (typeof stepNumber === 'string' ? parseInt(stepNumber, 10) : stepNumber) : undefined;
  const isNumeric = step !== undefined && !isNaN(step);
  const timelineBg = !isNumeric || (step !== undefined && step > 1) ? "timelineVerticalLineX" : "timelineVerticalLine1";
  const isDisabled = style === "disabled";

  // Si background est fourni, l'utiliser, sinon utiliser les backgrounds par défaut
  const backgroundList = background
    ? (Array.isArray(background) ? background : [background])
    : (isDisabled
        ? ["plusCorners", timelineBg, "lineSide"]
        : ["plusCorners", timelineBg, "lineSide"]);

  const backgrounds = resolveBackgrounds(backgroundList);
  const appearanceConfig = appearance ? resolveAppearances(appearance) : undefined;
  const showButton = buttonLabel && buttonHref;

  return (
    <section className={cn("bg-background border-b border-border", isDisabled && "grayscale")}>
      <Blob
        responsive={{
          base: {
            marker: "left",
            markerWidth: "default",
            layout: "stack",
            size: "md",
            align: "left",
            paddingX: "lg",
            paddingY: "lg",
            actions: showButton ? "before" : undefined,
          },
          md: {
            size: "xl",
            paddingX: "container-xl",
            paddingY: "4xl",
          },
          xl: {
            size: "2xl",
            layout: "bar",
            paddingY: "6xl",
            gapX: "5xl",
          },
        }}
        className={cn(
          backgrounds,
          "overflow-hidden",
          appearanceConfig?.blobClassName
        )}
      >
        <BlobBackground backgrounds={backgrounds} />
        <Marker rounded className={cn("w-media font-mono ring-8 ring-white", isDisabled && "bg-muted text-primary/40", appearanceConfig?.markerClassName)}>
          {MarkerIcon ? <MarkerIcon className="h-6 w-6" /> : stepNumber}
        </Marker>
        <BlobHeader className={cn(appearanceConfig?.headerClassName)}>
          {eyebrow && <Eyebrow className={cn(isDisabled && "opacity-40")}>{eyebrow}</Eyebrow>}
          <Title as={titleAs} emphasisText={emphasisText} className={cn(isDisabled && "opacity-40")}>{title}</Title>
          <Subtitle>
            {subtitle}
          </Subtitle>
        </BlobHeader>
        {showButton && (
          <BlobActions className={cn(appearanceConfig?.actionsClassName)}>
            <Button
              asChild
              variant={buttonVariant}
              data-theme={buttonTheme}
              className={buttonTheme ? `theme-${buttonTheme}` : undefined}
            >
              <Link href={buttonHref}>
                {buttonLabel}
              </Link>
            </Button>
          </BlobActions>
        )}
      </Blob>
    </section>
  );
}

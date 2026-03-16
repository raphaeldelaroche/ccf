"use client"

import { ReactNode, useId, useMemo, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules"
import type { SwiperOptions, Swiper as SwiperClass } from "swiper/types"
import { cn } from "@/lib/utils"
import type { SizeValue } from "./blob-grid"
import type { SwiperResponsiveConfig } from "@/lib/blob-iterator-mapper"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

/** Breakpoint → min-width pixels (matches Tailwind defaults) */
const BP_PX: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

const BREAKPOINT_ORDER = ["base", "sm", "md", "lg", "xl", "2xl"] as const

interface BlobSwiperProps {
  children: ReactNode
  gapX?: SizeValue
  /** Largeur CSS de chaque slide en mode slidesPerView:"auto" (ex: "300px", "80%") */
  swiperSlideWidth?: string
  className?: string
  swiperOptions?: Partial<SwiperOptions>
  /** Per-breakpoint responsive config for CSS-driven behavior */
  responsiveConfig?: SwiperResponsiveConfig
  /** Use container queries instead of media queries */
  useContainerQueries?: boolean
}

/**
 * Build a scoped <style> string for per-breakpoint navigation/pagination visibility
 * and slide width. Uses @media or @container queries depending on mode.
 */
function buildResponsiveCSS(
  scopeId: string,
  config: SwiperResponsiveConfig,
  containerMode: boolean
): string {
  const rules: string[] = []

  // Helper: wrap CSS in the appropriate query
  const wrapQuery = (bp: string, css: string) => {
    if (bp === "base") return css
    const px = BP_PX[bp]
    if (!px) return ""
    if (containerMode) {
      return `@container (min-width: ${px}px) { ${css} }`
    }
    return `@media (min-width: ${px}px) { ${css} }`
  }

  // ── Navigation visibility ──
  if (config.navigation) {
    // Resolve mobile-first: walk breakpoints, emit CSS when value changes
    let currentNav: boolean | undefined
    for (const bp of BREAKPOINT_ORDER) {
      if (bp in config.navigation) {
        const val = config.navigation[bp]!
        if (val !== currentNav) {
          const display = val ? "flex" : "none"
          rules.push(wrapQuery(bp,
            `[data-swiper-scope="${scopeId}"] .swiper-button-prev,` +
            `[data-swiper-scope="${scopeId}"] .swiper-button-next { display: ${display} !important; }`
          ))
          currentNav = val
        }
      }
    }
  }

  // ── Pagination visibility ──
  if (config.pagination) {
    let currentPag: boolean | undefined
    for (const bp of BREAKPOINT_ORDER) {
      if (bp in config.pagination) {
        const val = config.pagination[bp]!
        if (val !== currentPag) {
          const display = val ? "block" : "none"
          rules.push(wrapQuery(bp,
            `[data-swiper-scope="${scopeId}"] .swiper-pagination { display: ${display} !important; }`
          ))
          currentPag = val
        }
      }
    }
  }

  // ── Slide width ──
  if (config.slideWidth) {
    let currentWidth: string | undefined
    for (const bp of BREAKPOINT_ORDER) {
      if (bp in config.slideWidth) {
        const val = config.slideWidth[bp]!
        if (val !== currentWidth) {
          rules.push(wrapQuery(bp,
            `[data-swiper-scope="${scopeId}"] .swiper-slide { width: ${val} !important; }`
          ))
          currentWidth = val
        }
      }
    }
  }

  return rules.join("\n")
}

/**
 * BlobSwiper - Client Component wrapper autour de Swiper.js
 *
 * @param gapX - Espacement entre les slides (tokens de taille)
 * @param swiperOptions - Options Swiper.js (navigation, pagination, etc.)
 * @param responsiveConfig - Per-breakpoint overrides for CSS-driven behavior
 * @param className - Classes CSS supplémentaires
 */
export function BlobSwiper({
  children,
  gapX = "md",
  swiperSlideWidth,
  className,
  swiperOptions = {},
  responsiveConfig,
  useContainerQueries = false,
}: BlobSwiperProps) {
  const swiperRef = useRef<SwiperClass | null>(null)
  const reactId = useId()
  // Stable scope ID derived from React's useId (strip colons for CSS selector safety)
  const scopeId = reactId.replace(/:/g, "-")

  // Convertir gutter token en pixels pour Swiper
  const gapXMap: Record<SizeValue, number> = {
    none: 0,
    auto: 16,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 40,
    "3xl": 48,
    "4xl": 56,
    "5xl": 64,
    "6xl": 72,
    "7xl": 80,
    "8xl": 88,
    "9xl": 96,
    "10xl": 104
  }

  const defaultOptions: SwiperOptions = {
    modules: [Navigation, Pagination, Autoplay, A11y],
    spaceBetween: gapXMap[gapX] || 16,
    slidesPerView: "auto",
    grabCursor: true,
    ...swiperOptions
  }

  // Stable key that forces Swiper to remount when options that aren't
  // dynamically reactive change (navigation, pagination, loop, autoplay, centeredSlides).
  const swiperKey = JSON.stringify(swiperOptions ?? {})

  // In "auto" mode, slides keep their CSS/content width (optionally constrained by swiperSlideWidth).
  // In slidesPerView:N mode, Swiper calculates and sets widths via JS — no override needed.
  // When responsiveConfig.slideWidth exists, CSS handles widths per-breakpoint.
  const hasResponsiveSlideWidth = !!responsiveConfig?.slideWidth
  const slideStyle = !hasResponsiveSlideWidth && defaultOptions.slidesPerView === "auto"
    ? { width: swiperSlideWidth || "auto" }
    : undefined

  // Build scoped responsive CSS if needed
  const responsiveCSS = useMemo(() => {
    if (!responsiveConfig) return ""
    return buildResponsiveCSS(scopeId, responsiveConfig, useContainerQueries)
  }, [responsiveConfig, scopeId, useContainerQueries])

  // Convertir children en array pour les mapper en SwiperSlide
  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div
      data-slot="blob-swiper"
      data-swiper-scope={scopeId}
      className={cn("blob-iterator-swiper", className)}
    >
      {responsiveCSS && <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />}
      <Swiper key={swiperKey} {...defaultOptions} onSwiper={(swiper) => (swiperRef.current = swiper)}>
        {childrenArray.map((child, index) => (
          <SwiperSlide key={index} style={slideStyle}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

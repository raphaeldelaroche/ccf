"use client"

import { ReactNode, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules"
import type { SwiperOptions, Swiper as SwiperClass } from "swiper/types"
import { cn } from "@/lib/utils"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export type SizeValue = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "10xl"

interface BlobSwiperProps {
  children: ReactNode
  gutter?: SizeValue
  className?: string
  swiperOptions?: Partial<SwiperOptions>
}

/**
 * BlobSwiper - Client Component wrapper autour de Swiper.js
 *
 * @param gutter - Espacement entre les slides (tokens de taille)
 * @param swiperOptions - Options Swiper.js (navigation, pagination, etc.)
 * @param className - Classes CSS supplémentaires
 */
export function BlobSwiper({
  children,
  gutter = "md",
  className,
  swiperOptions = {}
}: BlobSwiperProps) {
  const swiperRef = useRef<SwiperClass | null>(null)

  // Convertir gutter token en pixels pour Swiper
  const gutterMap: Record<SizeValue, number> = {
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
    spaceBetween: gutterMap[gutter] || 16,
    slidesPerView: "auto",
    grabCursor: true,
    ...swiperOptions
  }

  // Convertir children en array pour les mapper en SwiperSlide
  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div
      data-slot="blob-swiper"
      className={cn("blob-iterator-swiper", className)}
    >
      <Swiper {...defaultOptions} onSwiper={(swiper) => (swiperRef.current = swiper)}>
        {childrenArray.map((child, index) => (
          <SwiperSlide key={index} style={{ width: "auto" }}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

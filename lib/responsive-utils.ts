/**
 * Responsive utilities for the NewEditor
 * Manages responsive breakpoint values in object form
 */

import type { Breakpoint, ResponsiveProps } from "@/lib/blob-compose"

export const BREAKPOINTS = ["base", "sm", "md", "lg", "xl", "2xl"] as const
export type { Breakpoint, ResponsiveProps }

/**
 * Get the value for a specific field at a specific breakpoint,
 * using mobile-first propagation (inherits from smaller breakpoints if not defined)
 */
export function getBreakpointValue(
  responsiveValues: ResponsiveProps | undefined,
  breakpoint: Breakpoint,
  field: string
): { value: unknown; inheritedFrom: Breakpoint | null } {
  // If no responsive values, return null
  if (!responsiveValues) {
    return { value: undefined, inheritedFrom: null }
  }

  // Check if value is defined at this breakpoint
  const breakpointProps = responsiveValues[breakpoint as keyof ResponsiveProps]
  if (breakpointProps && breakpointProps[field as keyof typeof breakpointProps] !== undefined) {
    return { value: breakpointProps[field as keyof typeof breakpointProps], inheritedFrom: null }
  }

  // Mobile-first propagation: check smaller breakpoints
  const breakpointIndex = BREAKPOINTS.indexOf(breakpoint as typeof BREAKPOINTS[number])
  for (let i = breakpointIndex - 1; i >= 0; i--) {
    const smallerBreakpoint = BREAKPOINTS[i]
    const smallerProps = responsiveValues[smallerBreakpoint as keyof ResponsiveProps]
    if (smallerProps && smallerProps[field as keyof typeof smallerProps] !== undefined) {
      return {
        value: smallerProps[field as keyof typeof smallerProps],
        inheritedFrom: smallerBreakpoint,
      }
    }
  }

  // No value found
  return { value: undefined, inheritedFrom: null }
}


/**
 * Get all breakpoints that have any override defined
 */
export function getBreakpointsWithOverrides(
  responsiveValues: ResponsiveProps | undefined
): Set<Breakpoint> {
  const overrides = new Set<Breakpoint>()
  if (!responsiveValues) return overrides

  for (const breakpoint of BREAKPOINTS) {
    const breakpointProps = responsiveValues[breakpoint as keyof ResponsiveProps]
    if (breakpointProps && Object.keys(breakpointProps).length > 0) {
      overrides.add(breakpoint)
    }
  }

  return overrides
}

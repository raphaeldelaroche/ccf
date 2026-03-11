import React from "react"
import type { IconObject } from "@/lib/blob-fields"

/**
 * Renders a recursive icon descriptor object into a React element.
 * Used by BlockRenderer and InspectorField in the new editor.
 */
export const renderIconObject = (iconObj: IconObject): React.ReactElement | null => {
  if (!iconObj) return null

  const { type, props } = iconObj
  const { children, ...otherProps } = props

  const defaultProps: Record<string, string | number> = {}

  if (type === "svg") {
    defaultProps.xmlns = "http://www.w3.org/2000/svg"
  }

  if (["path", "circle", "rect", "line"].includes(type)) {
    if (!otherProps.fill) defaultProps.fill = "none"
    if (!otherProps.stroke) defaultProps.stroke = "currentColor"
    if (!otherProps.strokeLinecap) defaultProps.strokeLinecap = "round"
    if (!otherProps.strokeLinejoin) defaultProps.strokeLinejoin = "round"
  }

  const Element = type as keyof React.JSX.IntrinsicElements

  return React.createElement(
    Element,
    { ...defaultProps, ...otherProps } as React.HTMLAttributes<HTMLElement>,
    children?.map((child, index) => {
      const element = renderIconObject(child)
      return element ? React.cloneElement(element, { key: index }) : null
    })
  )
}

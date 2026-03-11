import { Divider } from "@/components/blob/divider"

const spacingMap: Record<string, string> = {
  none: "0",
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
  "2xl": "4rem",
  "3xl": "6rem",
}

interface BlockDividerProps {
  orientation?: "horizontal" | "vertical"
  label?: string
  className?: string
  spacingBefore?: string
  spacingAfter?: string
}

export function BlockDivider({ orientation = "horizontal", label, className, spacingBefore, spacingAfter }: BlockDividerProps) {
  const style: React.CSSProperties = {
    ...(spacingBefore && spacingBefore !== "auto" ? { marginTop: spacingMap[spacingBefore] ?? spacingBefore } : {}),
    ...(spacingAfter && spacingAfter !== "auto" ? { marginBottom: spacingMap[spacingAfter] ?? spacingAfter } : {}),
  }
  return (
    <div style={style}>
      <Divider orientation={orientation} className={className}>
        {label || undefined}
      </Divider>
    </div>
  )
}

import { createReactBlockSpec } from "@blocknote/react"

const ALERT_TYPES = ["info", "warning", "error", "success"]
type AlertType = "info" | "warning" | "error" | "success"

const alertConfig: Record<AlertType, { icon: string; className: string }> = {
  info: {
    icon: "ℹ️",
    className: "border-blue-300 bg-blue-50 text-blue-900",
  },
  warning: {
    icon: "⚠️",
    className: "border-yellow-300 bg-yellow-50 text-yellow-900",
  },
  error: {
    icon: "🚨",
    className: "border-red-300 bg-red-50 text-red-900",
  },
  success: {
    icon: "✅",
    className: "border-green-300 bg-green-50 text-green-900",
  },
}

export const alertBlock = createReactBlockSpec(
  {
    type: "alert" as const,
    propSchema: {
      alertType: {
        default: "info",
        values: ALERT_TYPES,
      },
    },
    content: "inline",
  },
  {
    render: ({ block, contentRef }) => {
      const alertType = block.props.alertType as AlertType
      const { icon, className } = alertConfig[alertType]

      return (
        <div className={`flex items-start w-full gap-3 rounded-lg border px-4 py-3 my-1 ${className}`}>
          <span className="mt-0.5 shrink-0 text-base leading-none">{icon}</span>
          <div ref={contentRef} className="flex-1 text-sm leading-relaxed" />
        </div>
      )
    },
  }
)

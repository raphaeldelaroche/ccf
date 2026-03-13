'use client'

import { LayoutGrid } from "lucide-react"
import { RoleBadge } from "@/components/auth/RoleBadge"

export function SitemapHeader() {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
          <LayoutGrid className="text-muted-foreground h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sitemap</h1>
        </div>
      </div>
      <RoleBadge />
    </header>
  )
}

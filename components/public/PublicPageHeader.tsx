"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/auth/UserContext"
import { canAccessEditor } from "@/lib/auth/permissions"

interface PublicPageHeaderProps {
  currentSlug?: string
  pages?: Array<{ slug: string; title: string; href?: string }>
}

export function PublicPageHeader({ currentSlug, pages = [] }: PublicPageHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser();

  return (
    <>
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">

          <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-muted-foreground">
            Logo CCF
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu de navigation"
            className="h-9 w-9"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu latéral */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-80 bg-background border-r transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header du menu */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Navigation</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenu du menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">

              {/* Liste des pages */}
              {pages.length > 0 && (
                <div className="space-y-1">
                  {pages.map((page) => (
                    <Link
                      key={page.slug}
                      href={page.href ?? `/${page.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors",
                        currentSlug === page.slug && "bg-muted font-medium"
                      )}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Spacer pour compenser le header fixe */}
      <div className="h-[57px]" />

      {/* Bouton flottant → éditeur */}
      {currentSlug && canAccessEditor(user.role) && (
        <Link
          href={`/new-editor?page=${currentSlug}`}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-background text-foreground shadow-lg border hover:bg-muted transition-colors"
          aria-label="Modifier cette page"
        >
          <Pencil className="h-5 w-5" />
        </Link>
      )}
    </>
  )
}

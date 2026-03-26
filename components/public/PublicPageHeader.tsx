"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, Pencil, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// SVG pour les plus
const PLUS_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 4v12M4 10h12' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { useUser } from "@/lib/auth/UserContext"
import { canAccessEditor } from "@/lib/auth/permissions"

interface PublicPageHeaderProps {
  currentSlug?: string
}

type NavLink = { label: string; href: string }
type NavGroup = { label: string; children: NavLink[] }
type NavItem = NavLink | NavGroup

function hasChildren(item: NavItem): item is NavGroup {
  return "children" in item
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "ABOUT",
    children: [
      { label: "ABOUT CCF", href: "/about" },
      { label: "METHODOLOGY", href: "/methodology" },
      { label: "RESOURCES", href: "/resources" },
    ],
  },
  { label: "CONTACT", href: "/contact" },
]

export function PublicPageHeader({ currentSlug }: PublicPageHeaderProps) {
  const { user } = useUser()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="relative mx-auto max-w-[var(--container-2xl)] py-3 lg:py-6 px-8">
          {/* Lignes latérales */}
          <div
            className="absolute inset-x-4 inset-y-0 2xl:inset-x-0 pointer-events-none"
          >
            <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to left, var(--border) 1px, transparent 1px)",
              backgroundSize: "1px 100%, 1px 100%",
              backgroundPosition: "left top, right top",
              backgroundRepeat: "no-repeat",
            }}
            />


          {/* Plus en bas (gauche et droite) */}
          <div
            className="absolute pointer-events-none overflow-hidden"
            style={{
              bottom: -10,
              left: -10,
              right: -10,
              height: 20,
              backgroundImage: `url("${PLUS_SVG}"), url("${PLUS_SVG}")`,
              backgroundSize: "20px 20px",
              backgroundPosition: "bottom left, bottom right",
              backgroundRepeat: "no-repeat",
            }}
          />
          </div>

          <div className="max-w-[var(--container-xl)] mx-auto flex justify-between">
            {/* Logo */}
            <Link href="/home" className="shrink-0">
              <Image
                src="/logo-ccf.svg"
                alt="Climate Contribution Framework"
                width={120}
                height={40}
                priority
                className="h-8 w-auto sm:h-10 xl:h-14"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) =>
                hasChildren(item) ? (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-xs tracking-wider uppercase gap-1"
                      >
                        {item.label}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link
                            href={child.href}
                            className="text-xs tracking-wider uppercase"
                          >
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button key={item.label} variant="ghost" asChild>
                    <Link
                      href={item.href}
                      className="text-xs tracking-wider uppercase"
                    >
                      {item.label}
                    </Link>
                  </Button>
                )
              )}
            </nav>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  aria-label="Menu de navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader>
                  <SheetTitle>
                    <Image
                      src="/logo-ccf.svg"
                      alt="CCF"
                      width={100}
                      height={32}
                      className="h-7 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1">
                  {NAV_ITEMS.map((item) =>
                    hasChildren(item) ? (
                      <div key={item.label} className="space-y-1">
                        <span className="block px-3 py-2 text-xs tracking-wider text-muted-foreground uppercase">
                          {item.label}
                        </span>
                        {item.children.map((child) => (
                          <SheetClose key={child.href} asChild>
                            <Link
                              href={child.href}
                              className="block px-3 py-2 pl-6 text-sm tracking-wider uppercase rounded-md hover:bg-muted transition-colors"
                            >
                              {child.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    ) : (
                      <SheetClose key={item.label} asChild>
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm tracking-wider uppercase rounded-md hover:bg-muted transition-colors"
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    )
                  )}
                </nav>
              </SheetContent>
            </Sheet>

          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-14 lg:h-22 xl:h-26" />

      {/* Floating editor button */}
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

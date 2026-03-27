"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, ChevronDown, ChartCandlestick, BookOpen, Network, ArrowRight, Pen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Blob } from "@/components/blob/blob"

// SVG pour les plus
const PLUS_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 4v12M4 10h12' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { Title } from "../blob/title"
import { Subtitle } from "../blob/subtitle"
import { Marker } from "../blob/marker"

type NavLink = { label: string; href: string; asButton?: boolean }
type NavMenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string
}
type NavGroup = { label: string; children: NavMenuItem[] }
type NavItem = NavLink | NavGroup

function hasChildren(item: NavItem): item is NavGroup {
  return "children" in item
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "More",
    children: [
      {
        label: "About the CCF",
        href: "/about",
        icon: Network,
        description: "Learn about the Climate Contribution Framework"
      },
      {
        label: "Methodology",
        href: "/methodology",
        icon: ChartCandlestick,
        description: "Understand our assessment methodology"
      },
      {
        label: "Resources",
        href: "/resources",
        icon: BookOpen,
        description: "Access guides and documentation"
      },
      {
        label: "Contact us",
        href: "/contact",
        icon: Pen,
        description: "Get in touch with our team"
      }
    ],
  },
  { label: "Assess now", href: "/self-assessment", asButton: true },
]

export function PublicPageHeader() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
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
            <Link href="/" className="shrink-0">
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
                        className="text-xs tracking-wider uppercase gap-1 font-mono"
                      >
                        {item.label}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-96 p-0 shadow-2xl shadow-black/10 rounded-none">
                      
                      <div
                        className="absolute inset-x-4 inset-y-0 mx-auto max-w-[calc(var(--decoration-grid-container)+20px)] overflow-hidden pointer-events-none"
                        style={{
                          top: -8,
                          bottom: -8,
                          left: -7,
                          right: -7,
                          backgroundImage: `url("${PLUS_SVG}"), url("${PLUS_SVG}"), url("${PLUS_SVG}"), url("${PLUS_SVG}")`,
                          backgroundSize: "16px 16px",
                          backgroundPosition: "top left, top right, bottom left, bottom right",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      <div className="grid divide-y">
                        {item.children.map((child) => {
                          const Icon = child.icon
                          return (
                            <Link key={child.href} href={child.href} className="px-4 py-5 hover:bg-muted">
                              <Blob
                                responsive={{
                                  base: {
                                    marker: "left",
                                    // layout: "row",
                                    size: "xs",
                                    paddingX: "none",
                                    paddingY: "none",
                                    // gapX: "md",
                                  },
                                }}
                                className="hover:bg-muted rounded-lg"
                              >
                                <Marker className="w-media border-gray-300 [&_svg]:text-lime-500" variant={"outline"}>
                                  <Icon />
                                </Marker>
                                <Blob.Header>
                                  <Title className="!font-bold !text-xs mt-0.5 font-mono uppercase">{child.label}</Title>
                                  <Subtitle>{child.description}</Subtitle>
                                </Blob.Header>
                              </Blob>
                            </Link>
                          )
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : item.asButton ? (
                  <Button key={item.label} size="sm" asChild className="theme-lime !px-3.5 rounded-full">
                    <Link
                      href={item.href}
                      className="text-xs tracking-wider uppercase items-center font-mono"
                    >
                      {item.label}
                      <ArrowRight className="size-4 -mt-0.5" />
                    </Link>
                  </Button>
                ) : (
                  <Button key={item.label} variant="ghost" asChild>
                    <Link
                      href={item.href}
                      className="text-xs tracking-wider uppercase font-mono"
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
                    ) : item.asButton ? (
                      <SheetClose key={item.label} asChild>
                        <Button size="sm" asChild className="font-normal theme-lime w-full justify-start">
                          <Link
                            href={item.href}
                            className="text-sm tracking-wider uppercase"
                          >
                            {item.label}
                          </Link>
                        </Button>
                      </SheetClose>
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
    </>
  )
}

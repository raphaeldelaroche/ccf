"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus, LayoutTemplate, Eye } from "lucide-react"
import type { PageMeta } from "@/lib/page-storage"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SitemapClientProps {
  pages: PageMeta[]
  navSlugs?: Set<string>
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso?: string) {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

// ─────────────────────────────────────────────────────────────────────────────
// Rename dialog (isolated to avoid re-rendering the table)
// ─────────────────────────────────────────────────────────────────────────────

function RenamePageDialog({ slug, title }: { slug: string; title: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(title)
  const [newSlug, setNewSlug] = useState(slug)
  const [slugTouched, setSlugTouched] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleOpen(v: boolean) {
    setOpen(v)
    if (v) { setNewTitle(title); setNewSlug(slug); setSlugTouched(false); setError(null) }
  }

  function handleTitleChange(value: string) {
    setNewTitle(value)
    if (!slugTouched) setNewSlug(slugify(value))
  }

  async function handleRename() {
    setError(null)
    if (!newTitle.trim() || !newSlug.trim()) return
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          ...(newSlug.trim() !== slug ? { newSlug: newSlug.trim() } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data?.error ?? "Erreur lors du renommage"); return }
      setOpen(false)
      startTransition(() => { router.refresh() })
    } catch {
      setError("Erreur réseau")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8"
          aria-label={`Renommer « ${title} »`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renommer la page</DialogTitle>
          <DialogDescription>
            Modifiez le titre et/ou le slug de la page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rename-title">Titre</Label>
            <Input
              id="rename-title"
              value={newTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rename-slug">Slug</Label>
            <Input
              id="rename-slug"
              value={newSlug}
              onChange={(e) => { setSlugTouched(true); setNewSlug(e.target.value) }}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
            <p className="text-muted-foreground text-xs">
              Modifier le slug changera l&apos;URL de la page.
            </p>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            onClick={handleRename}
            disabled={!newTitle.trim() || !newSlug.trim() || isPending}
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Row delete button (isolated so the AlertDialog state doesn't re-render the table)
// ─────────────────────────────────────────────────────────────────────────────

function DeletePageButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    await fetch(`/api/pages/${slug}`, { method: "DELETE" })
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-8 w-8"
          disabled={isPending}
          aria-label={`Supprimer « ${title} »`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la page ?</AlertDialogTitle>
          <AlertDialogDescription>
            La page{" "}
            <span className="font-semibold text-foreground">« {title} »</span>{" "}
            ({slug}) sera définitivement supprimée. Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Create page dialog
// ─────────────────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function CreatePageDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [isCreating, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true)
    setSlug(value)
  }

  async function handleCreate() {
    setError(null)
    if (!title.trim() || !slug.trim()) return
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), title: title.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "Erreur lors de la création")
        return
      }
      setOpen(false)
      setTitle("")
      setSlug("")
      setSlugTouched(false)
      startTransition(() => {
        router.push(`/new-editor?page=${slug.trim()}`)
      })
    } catch {
      setError("Erreur réseau")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) { setTitle(""); setSlug(""); setSlugTouched(false); setError(null) }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nouvelle page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer une page</DialogTitle>
          <DialogDescription>
            Renseignez le titre et le slug de votre nouvelle page. Vous pourrez
            l&apos;éditer immédiatement dans l&apos;éditeur.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-title">Titre</Label>
            <Input
              id="page-title"
              placeholder="Ma super page"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-slug">Slug</Label>
            <Input
              id="page-slug"
              placeholder="ma-super-page"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <p className="text-muted-foreground text-xs">
              Lettres minuscules, chiffres et tirets uniquement.
            </p>
          </div>
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || !slug.trim() || isCreating}
          >
            {isCreating ? "Création…" : "Créer et éditer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main table component
// ─────────────────────────────────────────────────────────────────────────────

export function SitemapClient({ pages, navSlugs }: SitemapClientProps) {
  const [search, setSearch] = useState("")

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Rechercher une page…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-64 rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
        />
        <CreatePageDialog />
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Titre
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Slug
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Créé le
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Modifié le
              </th>
              <th className="text-muted-foreground w-28 px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  {search
                    ? "Aucune page ne correspond à votre recherche."
                    : "Aucune page pour l'instant."}
                </td>
              </tr>
            ) : (
              filtered.map((page) => (
                <tr
                  key={page.slug}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${page.slug}`}
                        className="hover:underline underline-offset-4"
                      >
                        {page.title}
                      </Link>
                      {navSlugs?.has(page.slug) && (
                        <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">
                          Nav
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                      {page.slug}
                    </code>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 tabular-nums">
                    {formatDate(page.createdAt)}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 tabular-nums">
                    {formatDate(page.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Rename */}
                      <RenamePageDialog slug={page.slug} title={page.title} />

                      {/* View public page */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-8 w-8"
                        asChild
                        aria-label={`Voir « ${page.title} »`}
                      >
                        <Link href={`/${page.slug}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>

                      {/* Open in editor */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-8 w-8"
                        asChild
                        aria-label={`Éditer « ${page.title} »`}
                      >
                        <Link href={`/new-editor?page=${page.slug}`}>
                          <LayoutTemplate className="h-3.5 w-3.5" />
                        </Link>
                      </Button>

                      {/* Delete */}
                      <DeletePageButton slug={page.slug} title={page.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer stats ── */}
      <p className="text-muted-foreground text-right text-xs">
        {filtered.length} page{filtered.length !== 1 ? "s" : ""}
        {search && pages.length !== filtered.length && ` sur ${pages.length}`}
      </p>
    </div>
  )
}

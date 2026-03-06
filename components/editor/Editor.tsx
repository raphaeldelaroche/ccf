"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  type DefaultReactSuggestionItem,
} from "@blocknote/react"
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions"
import { BlockNoteView } from "@blocknote/shadcn"
import { schema } from "@/lib/editor/schema"
import { BlockSelectionProvider } from "./block-selection-context"
import { Inspector } from "./Inspector"
import { Toolbar } from "./Toolbar"
import { useToast } from "@/hooks/use-toast"

export default function Editor() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const [pages, setPages] = useState<Array<{ slug: string; title: string }>>([])
  const [isSaving, setIsSaving] = useState(false)

  // Create BlockNote editor with custom schema
  const editor = useCreateBlockNote({
    schema,
  })

  // Load pages list on mount, then auto-load ?page= param if present
  useEffect(() => {
    const pageParam = searchParams.get("page")
    loadPagesList().then(() => {
      if (pageParam) loadPage(pageParam)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPagesList = async () => {
    try {
      const res = await fetch("/api/pages")
      if (!res.ok) throw new Error("Failed to load pages")
      const data = await res.json()
      setPages(data.pages || [])
    } catch (error) {
      console.error("Error loading pages:", error)
      toast({
        title: "Error",
        description: "Failed to load pages list",
        variant: "destructive",
      })
    }
  }

  const loadPage = useCallback(
    async (slug: string) => {
      try {
        const res = await fetch(`/api/pages/${slug}`)
        if (!res.ok) throw new Error("Failed to load page")
        const pageData = await res.json()

        // Load native BlockNote blocks directly — no conversion needed
        editor.replaceBlocks(editor.document, pageData.blocks || [])

        setCurrentPage(slug)
        router.replace(`/editor?page=${slug}`, { scroll: false })
        toast({
          title: "Page loaded",
          description: `Loaded page: ${pageData.title}`,
        })
      } catch (error) {
        console.error("Error loading page:", error)
        toast({
          title: "Error",
          description: "Failed to load page",
          variant: "destructive",
        })
      }
    },
    [editor, toast, router]
  )

  const savePage = useCallback(async () => {
    if (!currentPage) {
      toast({
        title: "No page selected",
        description: "Please load or create a page first",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Use BlockNote's native document format directly — no conversion
      const blocks = editor.document

      const res = await fetch(`/api/pages/${currentPage}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      })

      if (!res.ok) throw new Error("Failed to save page")

      toast({
        title: "✅ Page saved",
        description: `Saved ${blocks.length} blocks`,
      })
    } catch (error) {
      console.error("Error saving page:", error)
      toast({
        title: "❌ Error",
        description: "Failed to save page",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [currentPage, editor, toast])

  // Cmd+S / Ctrl+S → save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        savePage()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [savePage])

  const createPage = async (slug: string, title: string) => {
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title }),
      })

      if (!res.ok) throw new Error("Failed to create page")

      await loadPagesList()
      await loadPage(slug)

      toast({
        title: "Page created",
        description: `Created page: ${title}`,
      })
    } catch (error) {
      console.error("Error creating page:", error)
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
      })
    }
  }

  const insertAlertItem = (editor: typeof schema.BlockNoteEditor): DefaultReactSuggestionItem => ({
    title: "Alert",
    subtext: "Bloc d'alerte coloré (info, warning, error, success)",
    aliases: ["alerte", "warning", "info", "error", "success", "callout"],
    group: "Other",
    icon: <span style={{ fontSize: 18 }}>⚠️</span>,
    onItemClick: () =>
      insertOrUpdateBlockForSlashMenu(editor, {
        type: "alert",
        props: { alertType: "info" },
      }),
  })

  const insertBlobItem = (editor: typeof schema.BlockNoteEditor): DefaultReactSuggestionItem => ({
    title: "Blob",
    subtext: "Bloc de contenu flexible (hero, feature, CTA...)",
    aliases: ["block", "section", "hero", "feature", "cta", "blob"],
    group: "Other",
    icon: <span style={{ fontSize: 18 }}>🧩</span>,
    onItemClick: () =>
      insertOrUpdateBlockForSlashMenu(editor, {
        type: "blob",
        props: {
          title: "Nouveau bloc",
          size: "md",
          layout: "stack",
        },
      }),
  })

  const insertSectionItem = (editor: typeof schema.BlockNoteEditor): DefaultReactSuggestionItem => ({
    title: "Section",
    subtext: "Conteneur de mise en page avec contrôle de largeur",
    aliases: ["section", "container", "wrapper", "layout", "group"],
    group: "Other",
    icon: <span style={{ fontSize: 18 }}>📐</span>,
    onItemClick: () =>
      insertOrUpdateBlockForSlashMenu(editor, {
        type: "section",
      }),
  })

  const insertHeroBlob = () => {
    // Insert a Blob block with Hero preset
    editor.insertBlocks(
      [
        {
          type: "blob",
          props: {
            title: "Welcome to Blob Editor",
            subtitle: "Build beautiful pages with custom blocks",
            size: "xl",
            layout: "stack",
            align: "left", // Fixed: use 'left' instead of 'center' for marker-left
            paddingY: "10xl",
            theme: "blue",
            appearance: "card",
            markerType: "none", // Simplified: removed marker for now
          },
        },
      ],
      editor.getTextCursorPosition().block
    )
  }

  return (
    <BlockSelectionProvider>
      <div className="blob-editor flex h-screen w-full flex-col">
        {/* Toolbar */}
        <Toolbar
          pages={pages}
          currentPage={currentPage}
          onLoadPage={loadPage}
          onCreatePage={createPage}
          onSave={savePage}
          isSaving={isSaving}
          onInsertBlob={insertHeroBlob}
        />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-y-auto">
            <div className="">
              <BlockNoteView editor={editor} theme="light" slashMenu={false}>
                <SuggestionMenuController
                  triggerCharacter="/"
                  getItems={async (query) =>
                    filterSuggestionItems(
                      [
                        ...getDefaultReactSlashMenuItems(editor),
                        insertAlertItem(editor),
                        insertBlobItem(editor),
                        insertSectionItem(editor),
                      ],
                      query
                    )
                  }
                />
              </BlockNoteView>
            </div>
          </div>

          {/* Inspector */}
          <Inspector editor={editor} />
        </div>
      </div>
    </BlockSelectionProvider>
  )
}

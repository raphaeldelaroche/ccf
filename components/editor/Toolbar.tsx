"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Loader2 } from "lucide-react"

interface ToolbarProps {
  pages: Array<{ slug: string; title: string }>
  currentPage: string | null
  onLoadPage: (slug: string) => void
  onCreatePage: (slug: string, title: string) => void
  onSave: () => void
  isSaving: boolean
  onInsertBlob?: () => void
}

export function Toolbar({
  pages,
  currentPage,
  onLoadPage,
  onCreatePage,
  onSave,
  isSaving,
  onInsertBlob,
}: ToolbarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSlug, setNewSlug] = useState("")
  const [newTitle, setNewTitle] = useState("")

  const handleCreatePage = () => {
    if (!newSlug || !newTitle) return
    onCreatePage(newSlug, newTitle)
    setIsCreateDialogOpen(false)
    setNewSlug("")
    setNewTitle("")
  }

  return (
    <div className="border-b bg-background px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Blob Editor</h1>
          <span className="text-sm text-muted-foreground">
            {currentPage ? `/ ${currentPage}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Page selector */}
          <Select value={currentPage || ""} onValueChange={onLoadPage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a page" />
            </SelectTrigger>
            <SelectContent>
              {pages.map((page) => (
                <SelectItem key={page.slug} value={page.slug}>
                  {page.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Create page */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                + New Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new page</DialogTitle>
                <DialogDescription>
                  Enter a slug and title for the new page
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="my-page"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="My Page"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreatePage}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Insert Blob */}
          {onInsertBlob && (
            <Button onClick={onInsertBlob} variant="outline" size="sm">
              + Insert Blob
            </Button>
          )}

          {/* Save */}
          <Button onClick={onSave} disabled={isSaving || !currentPage} size="sm">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

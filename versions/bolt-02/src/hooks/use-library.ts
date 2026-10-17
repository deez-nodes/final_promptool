import * as React from "react"

import { supabase } from "@/lib/supabase"
import type { TabKey } from "@/store/prompt-store"

export type LibraryCategory =
  | "role"
  | "context"
  | "instruction"
  | "constraint"
  | "midtask"

export interface LibraryItem {
  id: string
  title: string
  topic: string
  kind: TabKey
  category: LibraryCategory
  tags: string[]
  content: string
}

interface UseLibraryResult {
  items: LibraryItem[]
  roles: LibraryItem[]
  loading: boolean
  error: string | null
}

export function useLibrary(kind: TabKey, query: string): UseLibraryResult {
  const [items, setItems] = React.useState<LibraryItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    const handle = setTimeout(async () => {
      setLoading(true)

      const { data, error: fetchError } = await supabase
        .from("prompt_docs")
        .select("id,title,topic,kind,category,tags,content")
        .order("title", { ascending: true })
        .limit(200)

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setItems([])
      } else {
        setError(null)
        setItems((data ?? []) as LibraryItem[])
      }
      setLoading(false)
    }, 120)

    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [])

  const scoped = React.useMemo(
    () => items.filter((item) => item.kind === kind || item.category === "role"),
    [items, kind]
  )

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return scoped
    return scoped.filter((item) =>
      [item.title, item.topic, item.content, item.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
  }, [scoped, query])

  const roles = React.useMemo(
    () => items.filter((item) => item.category === "role"),
    [items]
  )

  return { items: filtered, roles, loading, error }
}

export function splitRules(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
}

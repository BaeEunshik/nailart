"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"

// --- Types ---
interface Thumbnail {
  id: string
  prompt: string | null
  image_url: string | null
  created_at: string | null
}

interface SidebarProps {
  refreshKey?: number
  onSelectThumbnail?: (thumbnail: Thumbnail) => void
}

// --- SVG Icons ---
const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "방금 전"
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHr < 24) return `${diffHr}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}

export function Sidebar({ refreshKey, onSelectThumbnail }: SidebarProps) {
  const { user } = useAuth()
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchThumbnails = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("thumbnails")
      .select("id, prompt, image_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setThumbnails(data)
    }
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    fetchThumbnails()
  }, [fetchThumbnails, refreshKey])

  const handleDelete = async (e: React.MouseEvent, thumbnail: Thumbnail) => {
    e.stopPropagation()
    if (deletingId) return

    setDeletingId(thumbnail.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("thumbnails")
        .delete()
        .eq("id", thumbnail.id)

      if (!error) {
        setThumbnails((prev) => prev.filter((t) => t.id !== thumbnail.id))
      }
    } catch {
      console.error("Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {/* Collapse toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed left-0 top-1/2 z-40 -translate-y-1/2 flex h-8 w-5 items-center justify-center rounded-r-lg bg-white/5 border border-l-0 border-white/10 backdrop-blur-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
        style={{ left: isCollapsed ? 0 : 280 }}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeftIcon className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 280,
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-30 flex-shrink-0 overflow-hidden"
      >
        <div className="flex h-full w-[280px] flex-col bg-[#202020] pt-[72px]">
          {/* Glass header */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl">
                <ImageIcon className="h-3.5 w-3.5 text-white/60" />
              </div>
              <span className="text-sm font-medium text-white/80">My Thumbnails</span>
            </div>
            {thumbnails.length > 0 && (
              <span className="rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl px-2 py-0.5 text-[11px] text-white/40">
                {thumbnails.length}
              </span>
            )}
          </div>

          {/* Divider with glass effect */}
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* Scrollable gallery */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col gap-3 pt-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-white/[0.04] h-24" />
                ))}
              </div>
            ) : thumbnails.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 pt-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                  <ImageIcon className="h-5 w-5 text-white/20" />
                </div>
                <div>
                  <p className="text-sm text-white/40">아직 저장된 썸네일이 없어요</p>
                  <p className="mt-1 text-xs text-white/20">생성 후 저장하면 여기에 표시됩니다</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                  {thumbnails.map((thumbnail) => (
                    <motion.div
                      key={thumbnail.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => onSelectThumbnail?.(thumbnail)}
                      onMouseEnter={() => setHoveredId(thumbnail.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="group relative w-full cursor-pointer overflow-hidden rounded-xl text-left transition-all"
                    >
                      {/* Liquid glass card */}
                      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.06]">
                        {/* Subtle glass shine */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent rounded-xl" />

                        {/* Image */}
                        {thumbnail.image_url && (
                          <div className="relative aspect-video w-full overflow-hidden">
                            <Image
                              src={thumbnail.image_url}
                              alt={thumbnail.prompt || "Thumbnail"}
                              fill
                              sizes="250px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Hover overlay with glass effect */}
                            <AnimatePresence>
                              {hoveredId === thumbnail.id && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                                >
                                  <button
                                    onClick={(e) => handleDelete(e, thumbnail)}
                                    disabled={deletingId === thumbnail.id}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 border border-white/10 backdrop-blur-md text-white/70 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50"
                                  >
                                    {deletingId === thumbnail.id ? (
                                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    ) : (
                                      <TrashIcon className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Info */}
                        <div className="px-3 py-2.5">
                          {thumbnail.prompt && (
                            <p className="line-clamp-2 text-xs text-white/50 leading-relaxed">
                              {thumbnail.prompt}
                            </p>
                          )}
                          <p className="mt-1.5 text-[10px] text-white/25">
                            {formatDate(thumbnail.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Bottom glass accent */}
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="px-4 py-3">
            <p className="text-[10px] text-white/20 text-center">Nail Art Thumbnail Gallery</p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

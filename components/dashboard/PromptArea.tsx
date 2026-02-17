"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import Image from "next/image"
import { BorderBeam } from "@/components/shared/BorderBeam"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"

// --- Constants ---
const MAX_IMAGES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// --- Utility ---
type ClassValue = string | number | boolean | null | undefined
function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ")
}

// --- Radix Primitives ---
const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { showArrow?: boolean }
>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 max-w-[280px] rounded-md bg-[#252525] text-white px-1.5 py-1 text-xs",
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {props.children}
      {showArrow && <TooltipPrimitive.Arrow className="-my-px fill-[#252525]" />}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl bg-[#303030] p-3 text-white shadow-md outline-none",
        "animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

const Dialog = DialogPrimitive.Root
const DialogPortal = DialogPrimitive.Portal
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="relative bg-[#303030] rounded-[28px] overflow-hidden shadow-2xl p-1">
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-[#303030] p-1 hover:bg-[#515151] transition-all">
          <XIcon className="h-5 w-5 text-gray-200 hover:text-white" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

// --- SVG Icons ---
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
  </svg>
)

const LoaderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const ReferenceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

// --- Types ---
export interface GeneratedResult {
  imageData: string
  mimeType: string
  text?: string
  prompt: string
}

interface RefThumbnail {
  id: string
  prompt: string | null
  image_url: string | null
}

// --- PromptArea Component ---
interface PromptAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onGenerated?: (result: GeneratedResult) => void
  onGeneratingChange?: (isGenerating: boolean) => void
}

export const PromptArea = React.forwardRef<HTMLTextAreaElement, PromptAreaProps>(
  ({ className, onGenerated, onGeneratingChange, ...props }, ref) => {
    const { user } = useAuth()
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [value, setValue] = React.useState("")
    const [imagePreviews, setImagePreviews] = React.useState<string[]>([])
    const [selectedPreviewIndex, setSelectedPreviewIndex] = React.useState<number | null>(null)
    const [isRefPopoverOpen, setIsRefPopoverOpen] = React.useState(false)
    const [refThumbnails, setRefThumbnails] = React.useState<RefThumbnail[]>([])
    const [isLoadingRefs, setIsLoadingRefs] = React.useState(false)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    React.useImperativeHandle(ref, () => internalTextareaRef.current!, [])

    React.useLayoutEffect(() => {
      const textarea = internalTextareaRef.current
      if (textarea) {
        textarea.style.height = "auto"
        const newHeight = Math.min(textarea.scrollHeight, 200)
        textarea.style.height = `${newHeight}px`
      }
    }, [value])

    // 참조 팝오버가 열릴 때 썸네일 목록 로드
    React.useEffect(() => {
      if (!isRefPopoverOpen || !user) return
      let cancelled = false
      const fetchRefs = async () => {
        setIsLoadingRefs(true)
        const supabase = createClient()
        const { data } = await supabase
          .from("thumbnails")
          .select("id, prompt, image_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)
        if (!cancelled && data) setRefThumbnails(data)
        if (!cancelled) setIsLoadingRefs(false)
      }
      fetchRefs()
      return () => { cancelled = true }
    }, [isRefPopoverOpen, user])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      setError(null)
      if (props.onChange) props.onChange(e)
    }

    const handlePlusClick = () => {
      fileInputRef.current?.click()
    }

    const addImages = React.useCallback((files: File[]) => {
      const remaining = MAX_IMAGES - imagePreviews.length
      if (remaining <= 0) {
        setError(`이미지는 최대 ${MAX_IMAGES}개까지 첨부할 수 있습니다.`)
        return
      }

      const validFiles: File[] = []
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue
        if (file.size > MAX_FILE_SIZE) {
          setError(`"${file.name}" 파일이 5MB를 초과합니다.`)
          return
        }
        validFiles.push(file)
        if (validFiles.length >= remaining) break
      }

      if (validFiles.length === 0) return

      validFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews((prev) => {
            if (prev.length >= MAX_IMAGES) return prev
            return [...prev, reader.result as string]
          })
        }
        reader.readAsDataURL(file)
      })
    }, [imagePreviews.length])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files.length > 0) {
        addImages(Array.from(files))
      }
      event.target.value = ""
    }

    const handlePaste = React.useCallback((e: ClipboardEvent) => {
      if (isGenerating) return
      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }
      if (imageFiles.length > 0) addImages(imageFiles)
    }, [isGenerating, addImages])

    React.useEffect(() => {
      const el = internalTextareaRef.current?.closest("[data-prompt-area]")
      if (!el) return
      const target = el as HTMLElement
      target.addEventListener("paste", handlePaste as EventListener)
      return () => target.removeEventListener("paste", handlePaste as EventListener)
    }, [handlePaste])

    const handleRemoveImage = (index: number, e?: React.MouseEvent<HTMLButtonElement>) => {
      e?.stopPropagation()
      setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    }

    const handleAddReference = async (imageUrl: string) => {
      if (imagePreviews.length >= MAX_IMAGES) {
        setError(`이미지는 최대 ${MAX_IMAGES}개까지 첨부할 수 있습니다.`)
        return
      }
      // URL을 그대로 추가 (API에서 URL/data URL 모두 처리)
      setImagePreviews((prev) => [...prev, imageUrl])
      setIsRefPopoverOpen(false)
    }

    const handleSubmit = async () => {
      if (isGenerating) return
      if (!value.trim() && imagePreviews.length === 0) return

      setIsGenerating(true)
      onGeneratingChange?.(true)
      setError(null)

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: value.trim(),
            images: imagePreviews,
            aspectRatio: "16:9",
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "이미지 생성에 실패했습니다.")
          return
        }

        if (data.imageData && onGenerated) {
          onGenerated({
            imageData: data.imageData,
            mimeType: data.mimeType || "image/png",
            text: data.text,
            prompt: value.trim(),
          })
        }

        setValue("")
        setImagePreviews([])
      } catch {
        setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
      } finally {
        setIsGenerating(false)
        onGeneratingChange?.(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    }

    const hasValue = value.trim().length > 0 || imagePreviews.length > 0

    return (
      <div className="flex flex-col gap-3" data-prompt-area>
        <div
          className={cn(
            "relative flex flex-col rounded-[28px] p-2 shadow-sm transition-colors bg-[#303030] border-transparent cursor-text overflow-hidden",
            className
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
          />

          {/* 이미지 미리보기 영역 */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1 pt-1 mb-1">
              {imagePreviews.map((src, index) => (
                <Dialog
                  key={index}
                  open={selectedPreviewIndex === index}
                  onOpenChange={(open) => setSelectedPreviewIndex(open ? index : null)}
                >
                  <div className="relative group">
                    <button
                      type="button"
                      className="transition-transform"
                      onClick={() => setSelectedPreviewIndex(index)}
                    >
                      <Image
                        unoptimized={src.startsWith("data:")}
                        src={src}
                        alt={`첨부 이미지 ${index + 1}`}
                        width={58}
                        height={58}
                        className="h-14.5 w-14.5 rounded-[1rem] object-cover"
                      />
                    </button>
                    <button
                      onClick={(e) => handleRemoveImage(index, e)}
                      className="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#303030] text-white transition-colors hover:bg-[#515151] opacity-0 group-hover:opacity-100"
                      aria-label="이미지 제거"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                  <DialogContent>
                    <Image
                      unoptimized={src.startsWith("data:")}
                      src={src}
                      alt={`첨부 이미지 ${index + 1} 확대`}
                      width={800}
                      height={600}
                      className="w-full max-h-[95vh] object-contain rounded-[24px]"
                    />
                  </DialogContent>
                </Dialog>
              ))}
              {imagePreviews.length > 0 && (
                <span className="self-end pb-1 text-[10px] text-white/30">
                  {imagePreviews.length}/{MAX_IMAGES}
                </span>
              )}
            </div>
          )}

          <textarea
            ref={internalTextareaRef}
            rows={1}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="썸네일을 설명해주세요..."
            disabled={isGenerating}
            className="w-full resize-none border-0 bg-transparent p-3 text-white placeholder:text-gray-400 focus:ring-0 focus-visible:outline-none min-h-12 disabled:opacity-50"
            {...props}
          />

          <div className="mt-0.5 p-1 pt-0">
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-2">
                {/* 이미지 첨부 버튼 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handlePlusClick}
                      disabled={isGenerating || imagePreviews.length >= MAX_IMAGES}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-[#515151] focus-visible:outline-none disabled:opacity-50"
                    >
                      <PlusIcon className="h-6 w-6" />
                      <span className="sr-only">이미지 첨부</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" showArrow={true}>
                    <p>이미지 첨부 (최대 {MAX_IMAGES}개, 5MB)</p>
                  </TooltipContent>
                </Tooltip>

                {/* 참조 버튼 */}
                <Popover open={isRefPopoverOpen} onOpenChange={setIsRefPopoverOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={isGenerating}
                          className="flex h-8 items-center gap-2 rounded-full p-2 text-sm text-white transition-colors hover:bg-[#515151] focus-visible:outline-none disabled:opacity-50"
                        >
                          <ReferenceIcon className="h-4 w-4" />
                          참조
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" showArrow={true}>
                      <p>저장된 썸네일을 참조 이미지로 사용</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent side="top" align="start">
                    <p className="mb-2 text-xs text-white/50">저장된 썸네일을 클릭하여 참조로 추가</p>
                    {isLoadingRefs ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      </div>
                    ) : refThumbnails.length === 0 ? (
                      <p className="py-6 text-center text-xs text-white/30">저장된 썸네일이 없습니다</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                        {refThumbnails.map((thumb) =>
                          thumb.image_url ? (
                            <button
                              key={thumb.id}
                              onClick={() => handleAddReference(thumb.image_url!)}
                              className="relative aspect-video overflow-hidden rounded-lg border border-white/[0.06] hover:border-white/20 transition-all"
                            >
                              <Image
                                src={thumb.image_url}
                                alt={thumb.prompt || "썸네일"}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </button>
                          ) : null
                        )}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                <div className="ml-auto flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        disabled={isGenerating}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-[#515151] focus-visible:outline-none disabled:opacity-50"
                      >
                        <MicIcon className="h-5 w-5" />
                        <span className="sr-only">음성 녹음</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" showArrow={true}>
                      <p>음성 녹음</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!hasValue || isGenerating}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 bg-white text-black hover:bg-white/80 disabled:bg-[#515151] disabled:pointer-events-none"
                      >
                        {isGenerating ? (
                          <LoaderIcon className="h-5 w-5 animate-spin" />
                        ) : (
                          <SendIcon className="h-6 w-6" />
                        )}
                        <span className="sr-only">전송</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" showArrow={true}>
                      <p>{isGenerating ? "생성 중..." : "전송"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          </div>
          <BorderBeam
            duration={6}
            delay={0}
            size={200}
            className="from-transparent via-lime-500 to-transparent"
          />
          <BorderBeam
            duration={6}
            delay={2}
            size={200}
            className="from-transparent via-blue-500 to-transparent"
          />
          <BorderBeam
            duration={6}
            delay={4}
            size={200}
            className="from-transparent via-pink-500 to-transparent"
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>
    )
  }
)
PromptArea.displayName = "PromptArea"

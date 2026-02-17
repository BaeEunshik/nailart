"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar"
import { PromptArea, GeneratedResult } from "@/components/dashboard/PromptArea"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { createClient } from "@/lib/supabase/client"
import Loader from "@/components/shared/Loader"

// --- SVG Icons ---
const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const SaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  const handleGenerated = useCallback((newResult: GeneratedResult) => {
    setResult(newResult);
    setIsSaved(false);
    setSelectedImageUrl(null);
  }, []);

  const handleGeneratingChange = useCallback((generating: boolean) => {
    setIsGenerating(generating);
  }, []);

  const handleSelectThumbnail = useCallback((thumbnail: { image_url: string | null; prompt: string | null }) => {
    if (!thumbnail.image_url) return;
    setResult({
      imageData: "",
      mimeType: "image/png",
      text: undefined,
      prompt: thumbnail.prompt || "",
    });
    setIsSaved(true);
    setSelectedImageUrl(thumbnail.image_url);
  }, []);

  const handleDownload = () => {
    if (!result) return;
    const ext = result.mimeType === "image/jpeg" ? "jpg" : "png";
    const link = document.createElement("a");
    link.href = `data:${result.mimeType};base64,${result.imageData}`;
    link.download = `thumbnail-${Date.now()}.${ext}`;
    link.click();
  };

  const handleSaveToSupabase = async () => {
    if (!result || !user || isSaving) return;

    setIsSaving(true);
    try {
      const supabase = createClient();

      const byteCharacters = atob(result.imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const ext = result.mimeType === "image/jpeg" ? "jpg" : "png";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const storagePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(storagePath, byteArray, {
          contentType: result.mimeType,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(storagePath);

      const { error: dbError } = await supabase.from("thumbnails").insert({
        user_id: user.id,
        prompt: result.prompt,
        image_url: urlData.publicUrl,
        storage_path: storagePath,
        width: 1280,
        height: 720,
      });

      if (dbError) throw dbError;

      setIsSaved(true);
      setSidebarRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Save error:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#181818]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!user) return null;

  const hasContent = isGenerating || !!result;

  return (
    <div className="relative flex min-h-screen bg-[#181818]">
      {/* Grid Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <DashboardNavbar />

      {/* Sidebar */}
      <Sidebar
        refreshKey={sidebarRefreshKey}
        onSelectThumbnail={handleSelectThumbnail}
      />

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          {/* 제목 - 기본 상태에서만 표시 */}
          <AnimatePresence>
            {!hasContent && (
              <motion.h2
                key="heading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-6 text-center text-2xl font-medium text-white/80"
              >
                어떤 썸네일을 만들끼요옷?
              </motion.h2>
            )}
          </AnimatePresence>

          {/* Loader - 생성 중일 때 PromptArea 위에 나타남 */}
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center justify-center overflow-hidden mb-6"
                style={{ minHeight: isGenerating ? 320 : 0 }}
              >
                <Loader />
              </motion.div>
            )}

            {/* 결과 이미지 - 생성 완료 후 표시 */}
            {!isGenerating && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-6 flex flex-col gap-4"
              >
                <div className="overflow-hidden rounded-2xl bg-[#252525] shadow-xl">
                  <Image
                    unoptimized
                    src={selectedImageUrl || `data:${result.mimeType};base64,${result.imageData}`}
                    alt="Generated thumbnail"
                    width={1280}
                    height={720}
                    className="w-full object-contain"
                  />
                </div>

                {result.text && (
                  <p className="text-sm text-white/60 px-1">{result.text}</p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    다운로드
                  </button>

                  <button
                    onClick={handleSaveToSupabase}
                    disabled={isSaving || isSaved}
                    className="flex items-center gap-2 rounded-xl bg-[#303030] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#404040] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isSaved ? (
                      <>
                        <CheckIcon className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">저장 완료</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4" />
                        저장하기
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PromptArea - 항상 표시, 위 콘텐츠가 나타나면 자연스럽게 아래로 밀림 */}
          <PromptArea
            onGenerated={handleGenerated}
            onGeneratingChange={handleGeneratingChange}
          />
        </div>
      </main>
    </div>
  );
}

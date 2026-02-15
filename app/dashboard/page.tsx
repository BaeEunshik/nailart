"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar"
import { PromptArea } from "@/components/dashboard/PromptArea"

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#181818]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#181818]">
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

      {/* Center Prompt */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <h2 className="mb-6 text-center text-2xl font-medium text-white/80">
            어떤 썸네일을 만들끼요옷?
          </h2>
          <PromptArea />
        </div>
      </main>
    </div>
  );
}

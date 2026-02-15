"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ShaderBackground } from "@/components/shared/ShaderBackground"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen">
      <ShaderBackground />

      {/* Left - 3/5 */}
      <div className="relative z-10 flex w-3/5 flex-col bg-black/60">
        {/* YouTube Video */}
        <div className="flex-1 p-12 pb-0">
          <div className="h-full overflow-hidden rounded-2xl">
            <iframe
              src="https://www.youtube.com/embed/mhVgh640FUw?autoplay=0&rel=0"
              title="Nail Art Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>

        {/* NAILART Oversized Text */}
        <div className="px-12 py-10">
          <h1 className="text-[8rem] font-black leading-none tracking-tighter text-white/90">
            NAILART
          </h1>
        </div>
      </div>

      {/* Right - 2/5 */}
      <div className="relative z-10 flex w-2/5 items-center justify-center">
        <div className="w-full max-w-md px-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6">
              <Link href="/" className="font-[family-name:var(--font-playwrite)] text-3xl font-bold text-white tracking-tight">
                Nail Art
              </Link>

              <p className="text-center text-sm text-white/50">
                AI 썸네일 생성 서비스를 시작하세요
              </p>

              <div className="mt-4 w-full">
                <button
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-base font-medium text-white transition hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google로 계속하기
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-white/30">
                계속 진행하면{" "}
                <Link href="/terms" className="underline transition hover:text-white/50">이용약관</Link>
                {" "}및{" "}
                <Link href="/privacy" className="underline transition hover:text-white/50">개인정보처리방침</Link>
                에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

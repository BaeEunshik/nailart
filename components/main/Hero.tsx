"use client"

import { ShaderBackground } from "@/components/shared/ShaderBackground"

export function Hero() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <ShaderBackground />
      <div className="z-10 flex flex-col items-center gap-8 px-4">
        <h1 className="font-[family-name:var(--font-playwrite)] text-center text-8xl font-bold tracking-tighter text-white">
          Nail Art
        </h1>

        <p className="max-w-xl text-center text-lg text-white/70">
          AI가 당신의 유튜브 영상에 딱 맞는 썸네일을 만들어 드립니다.
          <br />
          클릭률을 높이는 썸네일, 몇 초 만에 완성하세요.
        </p>

        <a
          href="/auth"
          className="rounded-xl border border-white/30 bg-white/10 px-10 py-4 text-lg font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
        >
          Get Started
        </a>
      </div>
    </div>
  )
}

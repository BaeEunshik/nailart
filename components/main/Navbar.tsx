"use client"

import Image from "next/image"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-black/20 border-b border-white/10">
      {/* Left - Logo + Text */}
      <Link href="/" className="flex items-center gap-2">
        <div className="relative h-14 w-10 overflow-hidden rounded-lg">
          <Image
            src="/nail.png"
            alt="Nail Art"
            fill
            className="object-cover object-center mix-blend-lighten"
          />
        </div>
        <span className="font-[family-name:var(--font-playwrite)] text-lg font-bold text-white tracking-tight">Nail Art</span>
      </Link>

      {/* Center - Nav Links */}
      <div className="flex items-center gap-12">
        <Link href="#features" className="text-base text-white/70 transition hover:text-white">
          Features
        </Link>
        <Link href="#pricing" className="text-base text-white/70 transition hover:text-white">
          Pricing
        </Link>
        <Link href="#contact" className="text-base text-white/70 transition hover:text-white">
          Contact
        </Link>
      </div>

      {/* Right - CTA Button */}
      <Link
        href="#get-started"
        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        Get Started
      </Link>
    </nav>
  )
}

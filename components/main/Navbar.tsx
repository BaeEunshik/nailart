"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export function Navbar() {
  const { user, loading, signOut } = useAuth();

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

      {/* Right - Auth-aware CTA */}
      {loading ? (
        <div className="h-9 w-24 animate-pulse rounded-full bg-white/20" />
      ) : user ? (
        <div className="flex items-center gap-3">
          {user.user_metadata?.avatar_url && (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-sm text-white/80">
            {user.user_metadata?.full_name ?? user.email}
          </span>
          <button
            onClick={() => signOut()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/auth"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Get Started
        </Link>
      )}
    </nav>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function DashboardNavbar() {
  const { user, signOut } = useAuth();
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      {/* Logo - floating pill */}
      <Link
        href="/"
        className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 backdrop-blur-md transition hover:bg-white/10"
      >
        <div className="relative h-8 w-6 overflow-hidden rounded">
          <Image
            src="/nail.png"
            alt="Nail Art"
            fill
            className="object-cover object-center mix-blend-lighten"
          />
        </div>
        <span className="font-[family-name:var(--font-playwrite)] text-sm font-bold text-white tracking-tight">
          Nail Art
        </span>
      </Link>

      {/* Profile - floating pill */}
      <div ref={popoverRef} className="relative">
        <button
          onClick={() => setShowPopover(!showPopover)}
          className="flex items-center rounded-full bg-white/5 border border-white/10 p-1.5 backdrop-blur-md transition hover:bg-white/10"
        >
          {user?.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm text-white">
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </button>

        {showPopover && (
          <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#252525] shadow-2xl">
            <div className="flex items-center gap-3 p-4">
              {user?.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                  {user?.email?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user?.user_metadata?.full_name ?? "User"}
                </p>
                <p className="truncate text-xs text-white/50">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 p-1">
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

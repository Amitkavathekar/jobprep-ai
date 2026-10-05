"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NavLink {
  label: string
  href: string
}

const navLinks: NavLink[] = [
  { label: "Trusted", href: "#trusted" },
  { label: "About", href: "#about" },
  { label: "Modules", href: "#modules" },
  { label: "Workflow", href: "#workflow" },
  { label: "Membership Plans", href: "#pricing" },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-white bg-[#07071a]/85 px-6 py-3.5 backdrop-blur-xl transition-all lg:px-10">
      <Link href="/" className="group flex cursor-pointer items-center gap-3">
        <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-linear-to-br from-[#7c3aed] to-[#06b6d4] text-base font-extrabold text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
          JP
        </div>
        <div>
          <div className="text-[18px] leading-[1.1] font-extrabold tracking-tight text-white">
            JobPrep <span className="text-[#06b6d4]">AI</span>
          </div>
          <div className="text-[10px] font-medium text-slate-400/60">
            Enterprise Career Platform
          </div>
        </div>
      </Link>

      <nav className="hidden items-center gap-7 md:flex">
        {navLinks.map((e) => (
          <a
            key={e.href}
            href={e.href}
            className="cursor-pointer text-[13px] font-medium text-slate-300/75 transition-colors hover:text-white"
          >
            {e.label}
          </a>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <Button
          render={<Link href="/login" />}
          variant="outline"
          size="lg"
          className="rounded-lg border-white/12 bg-white/6 px-4.5 text-[13px] font-medium text-[#cbd5e1] transition-all hover:bg-white/10 hover:text-white"
        >
          Login
        </Button>
        <Button
          render={<Link href="/register" />}
          variant="default"
          size="lg"
          className="rounded-lg bg-linear-to-br from-[#7c3aed] to-[#06b6d4] px-5 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all hover:opacity-95 hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
        >
          Sign up
        </Button>
      </div>

      <button
        type="button"
        className="p-1.5 text-slate-300 hover:text-white focus:outline-none md:hidden"
        aria-controls="mobile-navigation"
      >
        op
      </button>
    </header>
  )
}

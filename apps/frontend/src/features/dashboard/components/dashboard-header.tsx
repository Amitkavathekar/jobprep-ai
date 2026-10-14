import { useState } from "react"
import { ArrowUpRight, ScanSearch, UserRound } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { AtsScannerModal } from "./ats-scanner-modal"
import type { DashboardUser } from "../types"

interface DashboardHeaderProps {
  user: DashboardUser | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showAtsModal, setShowAtsModal] = useState(false)
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "Arjun"
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[26px]">
          {greeting}
          <span className="bg-linear-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
            {firstName}
          </span>
          <span aria-hidden="true" className="ml-2">
            👋
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          {user?.professionalTitle
            ? `Your candidate profile is active (${user.professionalTitle}).`
            : "Your candidate profile is active (Senior Frontend Engineer)."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
          nativeButton={false}
          render={<Link href="/user/profile" />}
          variant="outline"
        >
          <UserRound aria-hidden="true" />
          Edit Complete Profile
        </Button>
        <Button
          className="border-0 bg-linear-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/15 hover:brightness-110"
          onClick={() => setShowAtsModal(true)}
        >
          <ScanSearch aria-hidden="true" />
          Check ATS Score
        </Button>
        <Button
          className="border-0 bg-linear-to-r from-violet-600 to-cyan-600 text-white hover:brightness-110"
          nativeButton={false}
          render={<Link href="/user/resume" />}
        >
          + New Analysis
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      </div>
      <AtsScannerModal
        key={user?.professionalTitle || "Senior Frontend Engineer"}
        initialJobRole={user?.professionalTitle || "Senior Frontend Engineer"}
        onOpenChange={setShowAtsModal}
        open={showAtsModal}
      />
    </header>
  )
}

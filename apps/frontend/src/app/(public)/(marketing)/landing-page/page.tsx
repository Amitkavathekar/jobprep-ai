"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PricingCard, type PricingPlan } from "@/components/landing/PricingCard";

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic",
    badge: "1 Month",
    priceINR: 499,
    period: "/ month",
    moEquivalent: "₹499/mo",
    mockLimit: "10 AI Interviews",
    atsLimit: "25 Resume Scans",
    popular: false,
    color: "text-slate-400",
    bgBorder: "border-white/10",
    features: [
      "10 AI Mock Interviews",
      "25 ATS Resume Scans",
      "Standard AI Feedback",
      "Email Support",
    ],
    cta: "Get Basic Plan",
  },
  {
    name: "Plus",
    badge: "3 Months",
    priceINR: 1299,
    period: "/ 3 months",
    moEquivalent: "₹433/mo",
    mockLimit: "35 AI Interviews",
    atsLimit: "75 Resume Scans",
    popular: false,
    color: "text-cyan-500",
    bgBorder: "border-white/10",
    features: [
      "35 AI Mock Interviews",
      "75 ATS Resume Scans",
      "Detailed Audio Feedback",
      "Priority Chat Support",
    ],
    cta: "Get Plus Plan",
  },
  {
    name: "Pro",
    badge: "6 Months",
    tag: "🔥 MOST POPULAR",
    priceINR: 2299,
    period: "/ 6 months",
    moEquivalent: "₹383/mo",
    mockLimit: "Unlimited",
    atsLimit: "Unlimited",
    popular: true,
    color: "text-violet-500",
    bgBorder:
      "border-violet-600 bg-gradient-to-b from-violet-600/20 to-slate-900 shadow-[0_20px_40px_rgba(124,58,237,0.3)]",
    features: [
      "Unlimited Mock Interviews",
      "Unlimited ATS Scans",
      "Live Speech Analysis",
      "1-on-1 AI Resume Opt",
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Elite VIP",
    badge: "1 Year",
    tag: "👑 BEST VALUE",
    priceINR: 3999,
    period: "/ 1 year",
    moEquivalent: "₹333/mo",
    mockLimit: "Unlimited + VIP",
    atsLimit: "Unlimited + VIP",
    popular: false,
    isElite: true,
    color: "text-amber-500",
    bgBorder:
      "border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-slate-900",
    features: [
      "All Pro Features",
      "VIP Priority Queue",
      "Job Application Tracker",
      "Placement Consultation",
    ],
    cta: "Get Elite VIP",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let role: string | null = null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        role = u?.role;
      } catch (e) {}
    }
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (e) {
      console.error("Sign out error:", e);
    }
    setIsAuthenticated(false);
    setUserRole(null);
    router.push("/login");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#07071a] font-sans text-slate-200 selection:bg-cyan-500/30">
      <header className="sticky top-0 z-[100] flex items-center justify-between border-b border-white/10 bg-[#07071a]/85 px-6 py-3 backdrop-blur-xl md:px-10 md:py-4">
        <div
          className="group flex cursor-pointer items-center gap-3"
          onClick={() => scrollToSection("hero")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-base font-extrabold text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-transform group-hover:scale-105">
            JP
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight text-white leading-tight">
              JobPrep <span className="text-cyan-500">AI</span>
            </div>
            <div className="text-[10px] font-medium text-slate-400">
              Enterprise Career Platform
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {[
            { label: "Trusted", id: "trusted" },
            { label: "About", id: "about" },
            { label: "Modules", id: "modules" },
            { label: "Workflow", id: "workflow" },
            { label: "Membership Plans", id: "pricing" },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-[13px] font-medium text-slate-300 transition-colors hover:text-white cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() =>
                  router.push(userRole === "admin" ? "/admin/dashboard" : "/user/dashboard")
                }
                variant="ghost"
                size="sm"
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10 h-auto cursor-pointer"
              >
                Dashboard
              </Button>
              <Button
                onClick={handleSignOut}
                size="sm"
                className="rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-2 text-[13px] font-semibold text-red-400 hover:bg-red-500/25 transition-all cursor-pointer h-auto"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => router.push("/login")}
                variant="ghost"
                size="sm"
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10 h-auto cursor-pointer"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push("/register")}
                size="sm"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all hover:scale-105 hover:from-violet-500 hover:to-cyan-400 h-auto cursor-pointer"
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </header>

      <section
        id="hero"
        className="relative flex min-h-[calc(100vh-70px)] flex-col items-center justify-center border-b border-white/10 px-6 py-20 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.3) 0%, transparent 70%), linear-gradient(180deg, #07071a 0%, #0d0d2e 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-600/15 px-4 py-1.5 text-xs font-semibold text-violet-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
            Trusted by 50,000+ candidates
          </div>

          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            A secure AI career platform <br className="hidden md:block" />
            designed for{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              enterprise workflows
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-300">
            Real-time analytics, ATS scanner, AI resume editor, and voice mock
            interview—built to streamline your entire job application lifecycle.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] font-medium text-slate-400 md:gap-8">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Secure
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500" /> Real-Time ATS Analytics
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-600" /> Cloud-Based & Instant AI
            </span>
          </div>
        </div>
      </section>

      <section
        id="trusted"
        className="border-b border-white/10 bg-gradient-to-b from-[#0d0d2e] to-[#07071a] px-6 py-20"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="mb-5 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              The Future of <br />
              <span className="text-cyan-500">Career & Resume AI</span> <br />
              For Modern Job Seekers
            </h2>
            <p className="mb-7 text-base leading-relaxed text-slate-300">
              Upload resumes, match job descriptions, analyze ATS compatibility,
              rewrite sections with AI, practice mock interviews, and view
              analytics from one intelligent career platform.
            </p>

            <div className="mb-5 text-[13px] font-semibold text-violet-400">
              Built for candidates, career switchers, SMEs, and enterprise recruiters.
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "Job Description Match",
                "ATS Keyword Diagnostic",
                "Live AI Resume Rewriter",
                "Voice Mock Interview",
                "Exportable PDF Reports",
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-slate-200"
                >
                  <span className="font-bold text-cyan-500">✓</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_rgba(6,182,212,0.2)] transition-transform duration-500 hover:-translate-y-2">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-white shadow-sm">
                  JP
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">JobPrep AI Dashboard</div>
                  <div className="text-[11px] text-slate-500">Welcome Back Arjun 👋</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 sm:block">
                  📅 Sep 05, 2026
                </span>
                <Button
                  onClick={() =>
                    router.push(userRole === "admin" ? "/admin/dashboard" : "/user/dashboard")
                  }
                  size="sm"
                  className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700 h-auto cursor-pointer"
                >
                  Open App
                </Button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="text-[11px] font-semibold text-slate-500">Total Resumes</div>
                <div className="text-xl font-extrabold text-slate-900">1,248</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="text-[11px] font-semibold text-slate-500">ATS Match Score</div>
                <div className="text-xl font-extrabold text-violet-600">98.6%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="text-[11px] font-semibold text-slate-500">Mock Interview</div>
                <div className="text-xl font-extrabold text-emerald-500">92% Pass</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Skill Match Growth</span>
                  <span className="font-medium text-slate-500">30 Days</span>
                </div>
                <div className="flex h-[75px] items-end gap-2 pb-1">
                  {[45, 55, 62, 70, 68, 85, 92, 98].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 rounded-t-md bg-gradient-to-b from-cyan-500 to-blue-500"
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <div className="mb-2 text-xs font-bold text-slate-900">Readiness</div>
                <div className="relative mx-auto mb-1.5 h-[70px] w-[70px]">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3.8"
                      strokeDasharray="92, 100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-900">
                    98%
                  </div>
                </div>
                <div className="text-[10px] font-bold text-emerald-500">Ready for Interview</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-white/10 bg-[#07071a] px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-stretch gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-10">
            <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.08em] text-cyan-500">
              About JobPrep AI
            </div>
            <h3 className="mb-4 text-3xl font-extrabold leading-tight text-white">
              Built for candidates & College students that move fast
            </h3>
            <p className="mb-6 text-[15px] leading-relaxed text-slate-300">
              JobPrep AI is an enterprise-grade Career & Resume Management System
              that streamlines job matching, document optimization, ATS keyword
              tracking, mock interviews, reporting, and organizational readiness.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Paperless Workflows", "Real-Time Analytics"].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                badge: "● Match",
                title: "Job & Resume Matching",
                desc: "Upload candidate CVs and target job specs to get instant alignment percentage.",
              },
              {
                badge: "● Diagnostic",
                title: "ATS Keyword Diagnostics",
                desc: "Check parser compatibility, formatting score, and keyword density.",
              },
              {
                badge: "● Editor",
                title: "Live AI Resume Editor",
                desc: "Rewrite bullet points, format sections, and update scores dynamically.",
              },
              {
                badge: "● Reports",
                title: "Reports & Exports",
                desc: "Comprehensive candidate analysis and historical score tracking.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <span className="mb-3 inline-block rounded-md bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-500">
                  {card.badge}
                </span>
                <h4 className="mb-2 text-lg font-bold text-white">{card.title}</h4>
                <p className="text-[13px] leading-relaxed text-slate-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="modules"
        className="border-b border-white/10 bg-gradient-to-b from-[#07071a] to-[#0d0d2b] px-6 py-20"
      >
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-cyan-500">
            Core Modules
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">
            Everything you need to run your career—end to end
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-base text-slate-300">
            Premium AI workflows for candidate profiles, resume editing, ATS checks,
            interview prep, mock interviews, and analytics.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "⊞",
                title: "Dashboard & KPIs",
                desc: "Role-aware insights, progress tracking & overall readiness KPIs.",
                color: "text-violet-500",
              },
              {
                icon: "✦",
                title: "AI Resume Builder",
                desc: "Understand your resume quality and improve bullet points quickly.",
                color: "text-cyan-500",
              },
              {
                icon: "▣",
                title: "ATS Matching",
                desc: "Score job roles against resumes for maximum recruiter compatibility.",
                color: "text-emerald-500",
              },
              {
                icon: "◉",
                title: "Mock Interview Lab",
                desc: "Run realistic interview simulations with crisp AI-generated feedback.",
                color: "text-orange-400",
              },
              {
                icon: "◎",
                title: "Candidate Reports",
                desc: "Export deeper performance reports and readiness summaries.",
                color: "text-pink-400",
              },
              {
                icon: "⚑",
                title: "Career Analytics",
                desc: "Track improvement, readiness and application momentum over time.",
                color: "text-yellow-400",
              },
            ].map((module, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left transition-transform duration-300 hover:-translate-y-1.5 hover:bg-white/8"
              >
                <div className={`mb-4 text-3xl font-extrabold ${module.color}`}>{module.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-white">{module.title}</h3>
                <p className="text-[14px] leading-relaxed text-slate-400">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b border-white/10 bg-[#07071a] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-cyan-500">
              Workflow
            </div>
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              How JobPrep AI helps you get hired faster
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Upload your resume, skills, and career goals in minutes.",
              },
              {
                step: "02",
                title: "Analyze & Optimize",
                desc: "Get ATS score, keyword gaps, and AI-powered resume improvements.",
              },
              {
                step: "03",
                title: "Practice & Apply",
                desc: "Prepare through mock interviews and track your job readiness.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-white/10 bg-white/5 p-7 text-left"
              >
                <div className="mb-6 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-400">
                  {step.step}
                </div>
                <h3 className="mb-3 text-xl font-extrabold text-white">{step.title}</h3>
                <p className="text-[14px] leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans Section using reusable PricingCard */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-cyan-500">
              Membership Plans
            </div>
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Flexible pricing built for every step of your career
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {pricingPlans.map((plan, idx) => (
              <PricingCard key={idx} plan={plan} />
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-[13px] text-slate-400">
            <span>🔒 256-bit SSL Encrypted Payment</span>
            <span>⚡ Instant Membership Activation</span>
            <span>💳 UPI, Credit/Debit Cards, NetBanking</span>
            <span>💬 24/7 Priority Support</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#04040f] px-6 pb-6 pt-10 text-xs text-slate-400 md:px-10">
        <div className="mx-auto mb-8 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-extrabold text-white">
                JP
              </div>
              <div className="text-[15px] font-extrabold text-white">
                JobPrep <span className="text-cyan-500">AI</span>
              </div>
            </div>
            <p className="mb-3 max-w-[280px] leading-relaxed">
              One platform for job seekers, resume analysis, ATS scoring, AI
              interview practice, and career analytics.
            </p>
            <div className="text-[11px] opacity-70">
              Built for modern professionals & HR teams.
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[13px] font-bold text-white">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              {[
                "Dashboard",
                "Job & Resume",
                "AI Analysis",
                "ATS Diagnostic",
                "Mock Interview",
                "Reports",
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={`/${item.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                    className="transition-colors hover:text-white"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[13px] font-bold text-white">Resources</h4>
            <ul className="flex flex-col gap-2">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Contact Support",
                "Documentation",
                "API Access",
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href="#" className="transition-colors hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[13px] font-bold text-white">Connect & Social</h4>
            <div className="mb-4 flex gap-3">
              {["🌐", "🐙", "💼", "💬"].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  {icon}
                </a>
              ))}
            </div>
            <div className="text-[11px] opacity-70">
              Status: <span className="font-semibold text-emerald-500">● All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/5 pt-4 text-[11px] opacity-70 sm:flex-row">
          <div>© {new Date().getFullYear()} JobPrep AI. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  name: string;
  badge: string;
  tag?: string;
  priceINR: number;
  period: string;
  moEquivalent: string;
  mockLimit: string;
  atsLimit: string;
  popular?: boolean;
  isElite?: boolean;
  color: string;
  bgBorder?: string;
  features: string[];
  cta: string;
  href?: string;
}

export interface PricingCardProps {
  plan: PricingPlan;
  className?: string;
}

export function PricingCard({ plan, className }: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-3xl border p-7 text-left transition-transform duration-300 hover:-translate-y-1.5",
        plan.bgBorder || "border-white/10",
        !plan.popular && !plan.isElite ? "bg-white/5" : "",
        className
      )}
    >
      <div>
        {plan.tag && (
          <div
            className={cn(
              "absolute -top-3.5 right-5 rounded-full px-3 py-1 text-[10px] font-extrabold text-white shadow-lg tracking-wider",
              plan.popular
                ? "bg-gradient-to-br from-violet-600 to-pink-500"
                : "bg-gradient-to-br from-amber-500 to-amber-700"
            )}
          >
            {plan.tag}
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[22px] font-extrabold text-white">{plan.name}</h3>
          <span
            className={cn(
              "rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold",
              plan.color
            )}
          >
            {plan.badge}
          </span>
        </div>

        <div className="mb-1 flex items-baseline gap-1.5">
          <span className="font-mono text-3xl font-extrabold text-white">
            ₹{plan.priceINR.toLocaleString("en-IN")}
          </span>
          <span className="text-[13px] text-slate-400">{plan.period}</span>
        </div>
        <div className="mb-5 text-xs font-semibold text-cyan-500">
          Equivalent to ~{plan.moEquivalent}
        </div>

        <div className="mb-5 rounded-xl border border-white/5 bg-black/25 p-3 text-xs text-slate-200">
          <div className="flex flex-col gap-1.5">
            <div>
              🎤 <strong className="font-semibold text-white">Mock:</strong> {plan.mockLimit}
            </div>
            <div>
              📊 <strong className="font-semibold text-white">ATS:</strong> {plan.atsLimit}
            </div>
          </div>
        </div>

        <hr className="mb-5 border-white/10" />

        <ul className="mb-7 flex flex-col gap-3">
          {plan.features.map((feat, fIdx) => (
            <li
              key={fIdx}
              className="flex items-start gap-2.5 text-[13px] leading-tight text-slate-300"
            >
              <span className={cn("font-extrabold", plan.color)}>✓</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href={plan.href || "/register"} className="w-full block">
        <Button
          size="lg"
          className={cn(
            "w-full rounded-xl py-3 text-center text-sm font-bold transition-all hover:scale-[1.02] h-auto cursor-pointer",
            plan.popular
              ? "bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:opacity-95"
              : plan.isElite
              ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:opacity-95"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
          )}
        >
          {plan.cta} →
        </Button>
      </Link>
    </div>
  );
}

export default PricingCard;

"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      // Store token in localStorage
      localStorage.setItem("token", token);

      // Redirect based on user role
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user/dashboard");
      }
    } else {
      router.push("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="size-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      <p className="text-sm font-medium text-slate-300">
        Authenticating & signing you in...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-[#07071a]">
      <Suspense fallback={<div className="text-sm text-slate-400">Loading...</div>}>
        <CallbackContent />
      </Suspense>
    </main>
  );
}

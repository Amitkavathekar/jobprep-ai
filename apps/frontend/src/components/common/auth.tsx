"use client";

import api, { getApiBaseUrl } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type AuthCardProps = {
  type: "login" | "register";
};

//loginshema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),

  password: z.string()
    .min(8, "Password must be at least 8 characters"),
});

//registercheema
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be less than 50 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

//TYPES

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

function SearchParamsHandler({ onError }: { onError: (error: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      onError(errorParam);
    }
  }, [searchParams, onError]);

  return null;
}

export default function AuthCard({ type }: AuthCardProps) {
  const isLogin = type === "login";
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const handleOAuth = (provider: "google" | "linkedin") => {
    const backendUrl = getApiBaseUrl();
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  //login form

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
//submit

  const onLogin = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      console.log("login success:", response.data);
      const role = response.data?.data?.role;
         if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user/dashboard");
      }
    } catch (error: any) {
    console.error("login error:", error);
        const message =
        error.response?.data?.message || "Invalid emailid or password";
    setAuthError(message);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      setAuthError(null);
      const response = await api.post("/auth/register", {
    
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      router.push("/login");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      setAuthError(message);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#07071a] px-5 py-10">
      <Suspense fallback={null}>
        <SearchParamsHandler onError={setAuthError} />
      </Suspense>

      <div className="pointer-events-none absolute -left-28 -top-28 size-96 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.24)_0%,transparent_70%)]" />

      <div className="pointer-events-none absolute -bottom-28 -right-28 size-96 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.2)_0%,transparent_70%)]" />

      <div className="relative w-full max-w-sm">

        <header className="mb-6 text-center">
          <p className="bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
            JobPrep AI
          </p>

          <p className="mt-1 text-xs text-slate-400">
            AI-Powered Career Intelligence Platform
          </p>
        </header>

        <Card className="gap-0 overflow-hidden border-white/10 bg-white/6 py-0 text-slate-100 shadow-2xl shadow-purple-950/30 ring-white/10 backdrop-blur-2xl">

          <CardHeader className="px-5 pt-5 pb-4">

            <nav className="mb-4 flex gap-1 rounded-lg bg-white/4 p-1">

              <Link
                href="/login"
                className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold transition-colors ${isLogin
                    ? "bg-linear-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-950/20"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold transition-colors ${!isLogin
                    ? "bg-linear-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-950/20"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Create Account
              </Link>

            </nav>

          </CardHeader>

          <CardContent className="px-5 pb-5">

            {authError && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-2.5 text-center text-xs text-red-400 border border-red-500/20">
                {authError}
              </div>
            )}

            {/* LOGIN FORM */}

            {isLogin ? (
              <form suppressHydrationWarning onSubmit={loginForm.handleSubmit(onLogin)}>

                <div className="flex flex-col gap-4">

                  {/* EMAIL */}

                  <div suppressHydrationWarning className="grid gap-2">

                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-slate-300"
                    >
                      Email Address
                    </Label>

                    <Input
                      id="email"
                      type="email"
                      placeholder="amitkavathekar@gmail.com"
                      autoComplete="email"
                      {...loginForm.register("email")}
                      className="h-9 rounded-lg border-white/10 bg-white/4 text-sm text-white placeholder:text-slate-500 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
                    />

                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-red-400">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}

                  </div>

                  {/* PASSWORD */}

                  <div suppressHydrationWarning className="grid gap-2">

                    <Label
                      htmlFor="password"
                      className="text-xs font-medium text-slate-300"
                    >
                      Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...loginForm.register("password")}
                        className="h-9 rounded-lg border-white/10 bg-white/4 pr-9 text-sm text-white placeholder:text-slate-500 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>

                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-red-400">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}

                  </div>

                  {/* FORGOT PASSWORD */}

                  <div className="text-right">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-violet-300 underline-offset-4 hover:text-violet-200 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  {/* SUBMIT */}

                  <Button
                    type="submit"
                    className="h-9 w-full rounded-lg bg-linear-to-r from-violet-600 to-cyan-500 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110"
                  >
                    Sign In →
                  </Button>

                </div>

              </form>
            ) : (

              /* REGISTER FORM */

              <form suppressHydrationWarning onSubmit={registerForm.handleSubmit(onRegister)}>

                <div className="flex flex-col gap-4">

                  {/* FULL NAME */}

                  <div suppressHydrationWarning className="grid gap-2">

                    <Label
                      htmlFor="fullName"
                      className="text-[13px] font-medium text-slate-300"
                    >
                      Full Name
                    </Label>

                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Amit K"
                      autoComplete="name"
                      {...registerForm.register("fullName")}
                      className="h-9 rounded-lg border-white/10 bg-white/4 text-sm text-white placeholder:text-slate-500 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
                    />

                    {registerForm.formState.errors.fullName && (
                      <p className="text-xs text-red-400">
                        {registerForm.formState.errors.fullName.message}
                      </p>
                    )}

                  </div>

                  {/* EMAIL */}

                  <div suppressHydrationWarning className="grid gap-2">

                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-slate-300"
                    >
                      Email Address
                    </Label>

                    <Input
                      id="email"
                      type="email"
                      placeholder="amitkavathekar@gmail.com"
                      autoComplete="email"
                      {...registerForm.register("email")}
                      className="h-9 rounded-lg border-white/10 bg-white/4 text-sm text-white placeholder:text-slate-500 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
                    />

                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-red-400">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}

                  </div>

                  {/* PASSWORD */}

                  <div suppressHydrationWarning className="grid gap-2">

                    <Label
                      htmlFor="password"
                      className="text-xs font-medium text-slate-300"
                    >
                      Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showRegisterPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...registerForm.register("password")}
                        className="h-9 rounded-lg border-white/10 bg-white/4 pr-9 text-sm text-white placeholder:text-slate-500 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                        aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>

                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-red-400">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}

                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div suppressHydrationWarning className="grid gap-2">

                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-medium text-slate-300"
                    >
                      Confirm Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...registerForm.register("confirmPassword")}
                        className="h-9 rounded-lg border-white/10 bg-white/4 pr-9 text-sm text-white placeholder:text-slate-500 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                        aria-label={
                          showRegisterConfirmPassword ? "Hide confirm password" : "Show confirm password"
                        }
                      >
                        {showRegisterConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>

                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-400">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}

                  </div>

                  {/* SUBMIT */}

                  <Button
                    type="submit"
                    className="h-9 w-full rounded-lg bg-linear-to-r from-violet-600 to-cyan-500 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110"
                  >
                    Create Account →
                  </Button>

                </div>

              </form>
            )}

            {/* OR CONTINUE WITH (LOGIN ONLY) */}
            {isLogin && (
              <div className="mt-5 flex flex-col gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative bg-[#0d0e29] px-2 text-[11px] text-slate-400">
                    or continue with
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOAuth("google")}
                    className="flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth("linkedin")}
                    className="flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none"
                  >
                    LinkedIn
                  </button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Secure authentication
        </p>

      </div>
    </main>
  );
}

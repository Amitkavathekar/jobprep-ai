"use client";

import { useRouter } from "next/navigation";
import ForgotPassword from "@/components/common/ForgotPassword";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <ForgotPassword
      onBackToLogin={() => router.push("/login")}
      onBackToLanding={() => router.push("/")}
    />
  );
}

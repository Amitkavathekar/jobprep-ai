"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MockInterview from "@/features/mock-interview/page";
import { Screen } from "@/types";

export default function UserMockInterviewPage() {
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      let userId = "";
      if (raw) {
        const u = JSON.parse(raw);
        userId = u?.id || u?._id || "";
        setHasSubscription(
          Boolean(u?.hasActiveSubscription || u?.isSubscribed || u?.plan)
        );
      }

      if (userId) {
        const unlocked =
          localStorage.getItem(`jobprep_analysis_unlocked_${userId}`) === "true" ||
          Boolean(localStorage.getItem(`jobprep_latest_analysis_${userId}`));
        setIsUnlocked(Boolean(unlocked));
      }
    } catch {
      setIsUnlocked(true);
    }
  }, []);

  const handleOpenUpgradeModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-membership-modal"));
    }
  };

  return (
    <MockInterview
      onNavigate={(screen: Screen) => router.push(`/user/${screen}`)}
      onComplete={() => router.push("/user/reports")}
      hasActiveSubscription={hasSubscription}
      onOpenUpgradeModal={handleOpenUpgradeModal}
      isStep2Enabled={isUnlocked}
    />
  );
}

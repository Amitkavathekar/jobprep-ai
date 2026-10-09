export function Sidebar() {
  return null
}
export const sidebarSections = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/user/dashboard", icon: "⌂" }],
  },
  {
    label: "Resume AI",
    items: [
      { label: "Resume Builder", href: "/user/resume", icon: "✎" },
      { label: "AI Analysis", href: "/user/ai-analysis", icon: "◈" },
      { label: "ATS Analysis", href: "/user/ats-analysis", icon: "◉" },
    ],
  },
  {
    label: "Interview",
    items: [
      { label: "Interview Prep", href: "/user/interview-prep", icon: "◷" },
      { label: "Mock Interview", href: "/user/mock-interview", icon: "◐" },
    ],
  },
  {
    label: "History",
    items: [{ label: "Reports", href: "/user/reports", icon: "◫" }],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/user/profile", icon: "◎" },
      { label: "Support", href: "/user/support", icon: "?" },
    ],
  },
] as const;

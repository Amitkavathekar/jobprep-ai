import AuthCard from "@/components/common/auth";


export default function LoginPage() {
  return (
    <main className="flex h-screen w-full bg-[#07071a]">
      <div className="flex w-full items-center justify-center">
        <AuthCard type="login" />
      </div>
    </main>
  );
}

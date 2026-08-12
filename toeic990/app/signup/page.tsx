import AuthCard from "@/components/AuthCard";
import SignupCard from "@/components/SignupCard";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-navy px-4 py-10">
      <div className="absolute inset-0 bg-aurora" />
      <div className="relative z-10">
        <AuthCard>
          <SignupCard />
        </AuthCard>
      </div>
    </main>
  );
}

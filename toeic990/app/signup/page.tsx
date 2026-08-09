import AuthCard from "@/components/AuthCard";
import SignupCard from "@/components/SignupCard";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <AuthCard>
        <SignupCard />
      </AuthCard>
    </main>
  );
}

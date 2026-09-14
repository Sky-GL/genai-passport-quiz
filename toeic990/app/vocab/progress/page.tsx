import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMasteryOverview, getWeakWords } from "@/lib/supabase/mastery";
import MasteryReport from "@/components/MasteryReport";

export default async function VocabProgressPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [overview, weakWords] = await Promise.all([getMasteryOverview(), getWeakWords(user.id)]);

  return <MasteryReport overview={overview} weakWords={weakWords} />;
}

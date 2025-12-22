import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function EditCoursePage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Modifier la formation
      </h1>

      <p className="mt-2 text-gray-400">
        ID du cours : {params.id}
      </p>
    </div>
  );
}


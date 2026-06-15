import { Song } from "@/types";
import { createClient } from "@/libs/supabase/server";

const getRecommendations = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    // If not logged in, just return 5 random songs
    const { data } = await supabase
      .from("songs")
      .select("*")
      .limit(5);

    return (data as any) || [];
  }

  const { data, error } = await supabase
    .rpc("get_recommendations", {
      user_id_param: session.user.id,
      limit_num: 5
    });

  if (error) {
    console.error("Recommendations Error:", error);
    return [];
  }

  return (data as any) || [];
};

export default getRecommendations;

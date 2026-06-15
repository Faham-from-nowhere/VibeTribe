import { Song } from "@/types";

import { createClient } from "@/libs/supabase/server";

const getSongsByUserId = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user?.id) {
    if (userError) console.error(userError);
    return [];
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) console.error(error.message);

  return (data as any) || [];
};

export default getSongsByUserId;

import { Song } from "@/types";

import { createClient } from "@/libs/supabase/server";

const getSongs = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error(error);

  return (data as any) || [];
};

export default getSongs;

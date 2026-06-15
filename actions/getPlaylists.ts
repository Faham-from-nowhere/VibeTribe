import { Playlist } from "@/types";
import { createClient } from "@/libs/supabase/server";

const getPlaylists = async (): Promise<Playlist[]> => {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user?.id) {
    if (userError) console.error(userError.message);
    return [];
  }

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

export default getPlaylists;

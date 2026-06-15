import { Song } from "@/types";

import { createClient } from "@/libs/supabase/client";
import useLocalSongs from "./useLocalSongs";

const useLoadSongUrl = (song: Song) => {
  const supabaseClient = createClient();
  const { urls } = useLocalSongs();

  if (!song) return "";

  if (urls[song.id]) {
    return urls[song.id];
  }

  const { data: songData } = supabaseClient.storage
    .from("songs")
    .getPublicUrl(song.song_path);

  return songData.publicUrl;
};

export default useLoadSongUrl;

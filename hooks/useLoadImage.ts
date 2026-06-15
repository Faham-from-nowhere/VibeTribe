import { Song } from "@/types";

import { createClient } from "@/libs/supabase/client";

const useLoadImage = (song: Song) => {
  const supabaseClient = createClient();

  if (!song) return null;
  if (song.isLocal) return song.image_path;

  const { data: imageData } = supabaseClient.storage
    .from("images")
    .getPublicUrl(song.image_path);

  return imageData.publicUrl;
};

export default useLoadImage;

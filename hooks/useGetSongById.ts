import { Song } from "@/types";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/libs/supabase/client";
import { toast } from "react-hot-toast";
import useLocalSongs from "./useLocalSongs";

const useGetSongById = (id?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<Song | undefined>(undefined);
  const { songs: localSongs } = useLocalSongs();

  const supabaseClient = createClient();

  useEffect(() => {
    if (!id) return;

    const localSong = localSongs.find((s) => s.id === id);
    if (localSong) {
      setSong(localSong);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchSong = async () => {
      const { data, error } = await supabaseClient
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setIsLoading(false);
        return toast.error(error.message);
      }

      setSong(data as Song);
      setIsLoading(false);
    };

    fetchSong();
  }, [id, supabaseClient, localSongs]);

  return useMemo(() => ({ isLoading, song }), [isLoading, song]);
};

export default useGetSongById;

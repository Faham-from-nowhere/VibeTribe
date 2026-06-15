import { Playlist, Song } from "@/types";
import { createClient } from "@/libs/supabase/server";

export interface PlaylistDetails extends Playlist {
  songs: Song[];
}

const getPlaylistById = async (id: string): Promise<PlaylistDetails | null> => {
  const supabase = await createClient();

  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single();

  if (playlistError) {
    console.log(playlistError.message);
    return null;
  }

  const { data: playlistSongs, error: songsError } = await supabase
    .from('playlist_songs')
    .select('*, songs(*)')
    .eq('playlist_id', id)
    .order('created_at', { ascending: true });

  if (songsError) {
    console.log(songsError.message);
    return null;
  }

  // Extract the actual song objects from the join table
  const songs = playlistSongs.map((ps: any) => ps.songs);

  return {
    ...playlist,
    songs
  };
};

export default getPlaylistById;

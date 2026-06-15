"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Song } from "@/types";
import { useUser } from "@/hooks/useUser";
import MediaItem from "@/components/MediaItem";
import LikeButton from "@/components/LikeButton";
import useOnPlay from "@/hooks/useOnPlay";
import { createClient } from "@/libs/supabase/client";
import { toast } from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";

interface PlaylistContentProps {
  playlistId: number;
  songs: Song[];
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({ playlistId, songs }) => {
  const router = useRouter();
  const { isLoading, user } = useUser();
  const onPlay = useOnPlay(songs);
  const supabase = createClient();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
        No songs in this playlist.
      </div>
    );
  }

  const removeFromPlaylist = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);

      if (error) throw error;
      
      toast.success("Removed from playlist");
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove song");
    }
  }

  return (
    <div className="flex flex-col gap-y-2 w-full p-6">
      {songs.map((song) => (
        <div key={song.id} className="flex items-center gap-x-4 w-full">
          <div className="flex-1">
            <MediaItem onClick={(id: string) => onPlay(id)} data={song} />
          </div>
          <LikeButton songId={song.id.toString()} />
          <button 
            onClick={() => removeFromPlaylist(song.id)}
            className="text-neutral-400 hover:text-white transition"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PlaylistContent;

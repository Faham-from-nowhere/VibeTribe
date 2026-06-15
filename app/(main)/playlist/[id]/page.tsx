import Header from "@/components/Header";
import PlaylistContent from "./components/PlaylistContent";
import getPlaylistById from "@/actions/getPlaylistById";
import Image from "next/image";
import React from "react";
import { TbPlaylist } from "react-icons/tb";

export const revalidate = 0;

interface PlaylistProps {
  params: Promise<{
    id: string;
  }>;
}

const PlaylistPage = async ({ params }: PlaylistProps) => {
  const { id } = await params;
  const playlist = await getPlaylistById(id);

  if (!playlist) {
    return (
      <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto flex items-center justify-center">
        <div className="text-neutral-400">Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mt-20">
          <div className="flex flex-col md:flex-row items-center gap-x-5">
            <div className="relative h-32 w-32 lg:h-44 lg:w-44 flex items-center justify-center bg-neutral-800 rounded-md shadow-lg overflow-hidden">
              {playlist.image_path ? (
                <Image
                  fill
                  src={`https://enslclfxdhezohzcesvn.supabase.co/storage/v1/object/public/images/${playlist.image_path}`}
                  alt="Playlist Cover"
                  className="object-cover"
                />
              ) : (
                <TbPlaylist size={64} className="text-neutral-400" />
              )}
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">Playlist</p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold truncate">
                {playlist.name}
              </h1>
            </div>
          </div>
        </div>
      </Header>
      <PlaylistContent playlistId={playlist.id} songs={playlist.songs} />
    </div>
  );
};

export default PlaylistPage;

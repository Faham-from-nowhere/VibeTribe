"use client";

import React from "react";
import { TbPlaylist } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";

import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import useOnPlay from "@/hooks/useOnPlay";
import useSubscribeModal from "@/hooks/useSubscribeModal";

import { Song, Playlist } from "@/types";
import MediaItem from "./MediaItem";
import LocalFilesScanner from "./LocalFilesScanner";
import useCreatePlaylistModal from "@/hooks/useCreatePlaylistModal";
import { useRouter } from "next/navigation";

interface LibraryProps {
  songs: Song[];
  playlists: Playlist[];
}

const Library: React.FC<LibraryProps> = ({ songs, playlists }) => {
  const subscribeModal = useSubscribeModal();
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const createPlaylistModal = useCreatePlaylistModal();
  const { user, subscription } = useUser();
  const router = useRouter();

  const onPlay = useOnPlay(songs);

  const onClick = () => {
    if (!user) return authModal.onOpen();

    if (!subscription && songs.length >= 1 && user.email !== "mohdfahamb@gmail.com") {
      return subscribeModal.onOpen();
    }

    return uploadModal.onOpen();
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="inline-flex items-center gap-x-2">
          <TbPlaylist className="text-neutral-400" size={26} />
          <p className="text-neutral-400 font-medium text-md">Your Library</p>
        </div>
        <div className="flex items-center gap-x-3">
          <button 
            onClick={() => {
              if (!user) return authModal.onOpen();
              createPlaylistModal.onOpen();
            }}
            className="text-neutral-400 cursor-pointer hover:text-white transition flex items-center gap-x-1 text-sm bg-neutral-800 px-2 py-1 rounded-md"
          >
            <AiOutlinePlus size={16} /> Playlist
          </button>
          <button 
            onClick={onClick}
            className="text-neutral-400 cursor-pointer hover:text-white transition flex items-center gap-x-1 text-sm bg-neutral-800 px-2 py-1 rounded-md"
          >
            <AiOutlinePlus size={16} /> Song
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 mt-4 px-3">
        {playlists.map((playlist) => (
          <div 
            key={playlist.id} 
            onClick={() => router.push(`/playlist/${playlist.id}`)}
            className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md"
          >
            <div className="w-[48px] h-[48px] bg-neutral-800 rounded-md flex items-center justify-center">
              <TbPlaylist className="text-neutral-400" size={24} />
            </div>
            <p className="text-white truncate">{playlist.name}</p>
          </div>
        ))}
        <hr className="border-neutral-800 my-2" />
        <LocalFilesScanner />
        {songs.map((song) => (
          <MediaItem
            onClick={(id: string) => onPlay(id)}
            key={song.id}
            data={song}
          />
        ))}
      </div>
    </div>
  );
};

export default Library;

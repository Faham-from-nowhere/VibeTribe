"use client";

import React from "react";
import Image from "next/image";

import { Song } from "@/types";
import useLoadImage from "@/hooks/useLoadImage";
import PlayButton from "./PlayButton";
import { TbPlaylistAdd } from "react-icons/tb";
import useAddToPlaylistModal from "@/hooks/useAddToPlaylistModal";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);
  const addToPlaylistModal = useAddToPlaylistModal();
  const { user } = useUser();
  const authModal = useAuthModal();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return authModal.onOpen();
    addToPlaylistModal.onOpen(data.id);
  }

  return (
    <div
      onClick={() => onClick(data.id)}
      className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-1"
    >
      <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
        <Image
          className="object-cover"
          src={imagePath || "/images/liked.png"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt="Album Artwork"
        />
      </div>
      <div className="flex flex-col items-start w-full p-2 gap-y-1">
        <p className="font-semibold truncate w-full">{data.title}</p>
        <p className="text-neutral-400 text-sm pb-1 w-full truncate">
          By {data.author}
        </p>
      </div>
      <div className="absolute bottom-24 right-3 z-10">
        <button 
          onClick={handleAdd}
          className="transition opacity-0 rounded-full flex items-center bg-emerald-500 p-2 drop-shadow-md translate translate-y-1/4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110"
        >
          <TbPlaylistAdd className="text-black" size={20} />
        </button>
      </div>
      <div className="absolute bottom-24 right-16 z-10">
        <PlayButton />
      </div>
    </div>
  );
};

export default SongItem;

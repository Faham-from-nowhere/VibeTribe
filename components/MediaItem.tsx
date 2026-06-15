"use client";

import useLoadImage from "@/hooks/useLoadImage";
import usePlayer from "@/hooks/usePlayer";

import { Song } from "@/types";

import React from "react";
import Image from "next/image";
import { TbPlaylistAdd } from "react-icons/tb";
import useAddToPlaylistModal from "@/hooks/useAddToPlaylistModal";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";

interface MediaItemProps {
  data: Song;
  onClick?: (id: string) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ data, onClick }) => {
  const player = usePlayer();
  const imageUrl = useLoadImage(data);
  const addToPlaylistModal = useAddToPlaylistModal();
  const { user } = useUser();
  const authModal = useAuthModal();

  const handleClick = () => {
    if (onClick) return onClick(data.id);

    return player.setId(data.id);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return authModal.onOpen();
    addToPlaylistModal.onOpen(data.id);
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md"
    >
      <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
        <Image
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={imageUrl || "/images/liked.png"}
          alt="Media Item Image"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden flex-1">
        <p className="text-white truncate">{data.title}</p>
        <p className="text-neutral-400 text-sm truncate">{data.author}</p>
      </div>
      <button 
        onClick={handleAdd}
        className="text-neutral-400 hover:text-white transition p-2"
      >
        <TbPlaylistAdd size={20} />
      </button>
    </div>
  );
};

export default MediaItem;

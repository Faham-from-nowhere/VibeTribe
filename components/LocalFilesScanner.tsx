"use client";

import React from "react";
import * as musicMetadata from "music-metadata-browser";
import { TbFolderPlus } from "react-icons/tb";
import useLocalSongs from "@/hooks/useLocalSongs";
import usePlayer from "@/hooks/usePlayer";

const LocalFilesScanner = () => {
  const { addLocalSong, songs } = useLocalSongs();
  const player = usePlayer();

  const handleScan = async () => {
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      
      const newSongs = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file" && entry.name.endsWith(".mp3")) {
          const file = await entry.getFile();
          
          try {
            const metadata = await musicMetadata.parseBlob(file);
            let imageUrl = "/images/liked.png";
            
            if (metadata.common.picture && metadata.common.picture.length > 0) {
              const picture = metadata.common.picture[0];
              const blob = new Blob([picture.data as any], { type: picture.format });
              imageUrl = URL.createObjectURL(blob);
            }
            
            const audioUrl = URL.createObjectURL(file);
            const id = `local-${crypto.randomUUID()}`;
            
            const newSong = {
              id,
              user_id: "local-user",
              author: metadata.common.artist || "Unknown Artist",
              title: metadata.common.title || entry.name.replace(".mp3", ""),
              song_path: "local",
              image_path: imageUrl,
              isLocal: true,
            };
            
            addLocalSong(newSong, audioUrl);
            newSongs.push(id);
          } catch (e) {
            console.error("Error parsing file", entry.name, e);
          }
        }
      }
      
      if (newSongs.length > 0) {
        player.setIds([...player.ids, ...newSongs]);
      }
      
    } catch (err) {
      console.log("User cancelled or error", err);
    }
  };

  return (
    <div
      onClick={handleScan}
      className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md transition"
    >
      <div className="relative min-h-[48px] min-w-[48px] flex justify-center items-center rounded-md bg-neutral-800">
        <TbFolderPlus size={24} className="text-neutral-400" />
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className="text-white truncate font-medium">Scan Local Folder</p>
        <p className="text-neutral-400 text-sm truncate">
          {songs.length > 0 ? `${songs.length} local songs loaded` : "Add MP3 files"}
        </p>
      </div>
    </div>
  );
};

export default LocalFilesScanner;

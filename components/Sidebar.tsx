"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { twMerge } from "tailwind-merge";
import { FiX } from "react-icons/fi";

import Box from "./Box";
import SidebarItem from "./SidebarItem";
import Library from "./Library";
import RightSidebar from "./RightSidebar";

import { Song, Playlist } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import useMobileMenu from "@/hooks/useMobileMenu";

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
  playlists: Playlist[];
}

const Sidebar: React.FC<SidebarProps> = ({ children, songs, playlists }) => {
  const pathname = usePathname();
  const player = usePlayer();
  const mobileMenu = useMobileMenu();

  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: "Home",
        active: pathname === "/listen",
        href: "/listen"
      },
      {
        icon: BiSearch,
        label: "Search",
        active: pathname === "/search",
        href: "/search"
      }
    ],
    [pathname]
  );

  return (
    <div
      className={twMerge(
        "flex h-full",
        player.activeId && "h-[calc(100%-80px)]"
      )}
    >
      <div className="hidden md:flex flex-col gap-y-2 bg-black h-full w-[300px] p-2">
        <Box>
          <div className="flex flex-col gap-y-4 px-5 py-4">
            {routes.map((route) => (
              <SidebarItem key={route.label} {...route} />
            ))}
          </div>
        </Box>
        <Box className="overflow-y-auto h-full">
          <Library songs={songs} playlists={playlists} />
        </Box>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileMenu.isOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex">
          <div className="flex flex-col w-[85%] max-w-[350px] bg-neutral-900 h-full shadow-2xl overflow-y-auto pt-4 relative">
            <button 
              onClick={mobileMenu.onClose}
              className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-full text-white hover:bg-neutral-700 transition z-50"
            >
              <FiX size={24} />
            </button>
            <div className="flex flex-col gap-y-4 px-5 py-4 mt-12">
              {routes.map((route) => (
                <SidebarItem key={route.label} {...route} />
              ))}
            </div>
            <div className="flex-1 overflow-y-auto mt-2">
              <Library songs={songs} playlists={playlists} />
            </div>
          </div>
          <div className="flex-1" onClick={mobileMenu.onClose} />
        </div>
      )}

      <main className="h-full flex-1 overflow-y-auto py-2 md:pr-2 lg:pr-0">
        {children}
      </main>
      <RightSidebar />
    </div>
  );
};

export default Sidebar;

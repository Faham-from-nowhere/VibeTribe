import { create } from 'zustand';
import { Song } from '@/types';

interface LocalSongsStore {
  songs: Song[];
  urls: Record<string, string>;
  addLocalSong: (song: Song, url: string) => void;
}

const useLocalSongs = create<LocalSongsStore>((set) => ({
  songs: [],
  urls: {},
  addLocalSong: (song, url) => set((state) => ({ 
    songs: [...state.songs, song],
    urls: { ...state.urls, [song.id]: url }
  })),
}));

export default useLocalSongs;

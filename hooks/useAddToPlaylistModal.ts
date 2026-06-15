import { create } from 'zustand';

interface AddToPlaylistModalStore {
  isOpen: boolean;
  songId: number | null;
  onOpen: (id: number) => void;
  onClose: () => void;
}

const useAddToPlaylistModal = create<AddToPlaylistModalStore>((set) => ({
  isOpen: false,
  songId: null,
  onOpen: (id: number) => set({ isOpen: true, songId: id }),
  onClose: () => set({ isOpen: false, songId: null }),
}));

export default useAddToPlaylistModal;

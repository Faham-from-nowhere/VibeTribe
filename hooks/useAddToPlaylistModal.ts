import { create } from 'zustand';

interface AddToPlaylistModalStore {
  isOpen: boolean;
  songId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}

const useAddToPlaylistModal = create<AddToPlaylistModalStore>((set) => ({
  isOpen: false,
  songId: null,
  onOpen: (id: string) => set({ isOpen: true, songId: id }),
  onClose: () => set({ isOpen: false, songId: null }),
}));

export default useAddToPlaylistModal;

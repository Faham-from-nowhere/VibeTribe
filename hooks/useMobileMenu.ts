import { create } from 'zustand';

interface MobileMenuStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useMobileMenu = create<MobileMenuStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useMobileMenu;

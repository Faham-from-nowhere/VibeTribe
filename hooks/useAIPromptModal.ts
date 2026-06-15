import { create } from "zustand";

interface AIPromptModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useAIPromptModal = create<AIPromptModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useAIPromptModal;

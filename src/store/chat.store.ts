import { create } from "zustand";

interface ChatContext {
  productId?:   string;
  productName?: string;
  isOpen:       boolean;
}

interface ChatStore extends ChatContext {
  openChat:  (context?: { productId?: string; productName?: string }) => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen:      false,
  productId:   undefined,
  productName: undefined,

  openChat: (context) =>
    set({
      isOpen:      true,
      productId:   context?.productId,
      productName: context?.productName,
    }),

  closeChat: () =>
    set({ isOpen: false, productId: undefined, productName: undefined }),
}));

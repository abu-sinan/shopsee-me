// @ts-nocheck
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistStore = {
  productIds: string[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      toggle: (productId) =>
        set((s) => ({
          productIds: s.productIds.includes(productId)
            ? s.productIds.filter((id) => id !== productId)
            : [...s.productIds, productId],
        })),

      has: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "shopsee-wishlist",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        return localStorage;
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      skipHydration: true,
    }
  )
);

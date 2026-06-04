import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product, ProductVariant } from "@/types";

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addItem: (product, variant, quantity = 1) => {
        const existingId = `${product.id}-${variant.id}`;
        const existing = get().items.find((i) => i.id === existingId);
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.id === existingId
                ? { ...i, quantity: Math.min(i.quantity + quantity, variant.stock) }
                : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, { id: existingId, product, variant, quantity }] }));
        }
        set({ isOpen: true });
      },

      removeItem: (itemId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) { get().removeItem(itemId); return; }
        set((s) => ({ items: s.items.map((i) => i.id === itemId ? { ...i, quantity } : i) }));
      },

      clearCart: () => set({ items: [] }),
      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: "shopsee-cart",
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

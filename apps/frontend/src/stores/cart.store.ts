import { create } from 'zustand';
import { CartItem } from '@tina/shared';
import { api } from '../lib/api';

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ items: data.data.items, total: data.data.total });
    } catch {
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    const { data } = await api.post('/cart/items', item);
    const total = data.data.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);
    set({ items: data.data, total });
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
    const total = data.data.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);
    set({ items: data.data, total });
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    const total = data.data.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);
    set({ items: data.data, total });
  },

  clearCart: async () => {
    await api.delete('/cart');
    set({ items: [], total: 0 });
  },
}));

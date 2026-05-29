import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '@/lib/api';

interface GroceryItem {
  id: number;
  list_id: number;
  name: string;
  name_hi?: string;
  quantity: number;
  unit: string;
  category: string;
  is_checked: number;
  is_recurring: number;
}

interface GroceryList {
  id: number;
  name: string;
}

interface GroceryState {
  lists: GroceryList[];
  items: Record<number, GroceryItem[]>;
  activeListId: number | null;
  isLoading: boolean;
  fetchLists: () => Promise<void>;
  fetchItems: (listId: number) => Promise<GroceryItem[]>;
  createList: (name: string) => Promise<GroceryList>;
  deleteList: (id: number) => Promise<void>;
  addItem: (listId: number, item: unknown) => Promise<GroceryItem>;
  toggleItem: (listId: number, itemId: number) => Promise<void>;
  deleteItem: (listId: number, itemId: number) => Promise<void>;
  resetList: (listId: number) => Promise<void>;
  setActiveList: (id: number) => void;
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set, get) => ({
      lists: [],
      items: {},
      activeListId: null,
      isLoading: false,

      fetchLists: async () => {
        set({ isLoading: true });
        try {
          const lists = await api.getLists();
          set({ lists, isLoading: false });
          if (!get().activeListId && lists.length > 0) {
            set({ activeListId: lists[0].id });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      fetchItems: async (listId) => {
        const items = await api.getItems(listId);
        set((s) => ({ items: { ...s.items, [listId]: items } }));
        return items;
      },

      createList: async (name) => {
        const list = await api.createList(name);
        set((s) => ({ lists: [list, ...s.lists], activeListId: list.id }));
        return list;
      },

      deleteList: async (id) => {
        await api.deleteList(id);
        set((s) => {
          const lists = s.lists.filter((l) => l.id !== id);
          return {
            lists,
            activeListId:
              s.activeListId === id ? (lists[0]?.id || null) : s.activeListId,
          };
        });
      },

      addItem: async (listId, item) => {
        const newItem = await api.addItem(listId, item);
        set((s) => ({
          items: {
            ...s.items,
            [listId]: [...(s.items[listId] || []), newItem],
          },
        }));
        return newItem;
      },

      toggleItem: async (listId, itemId) => {
        const updated = await api.toggleItem(itemId);
        set((s) => ({
          items: {
            ...s.items,
            [listId]: (s.items[listId] || []).map((i) =>
              i.id === itemId ? updated : i,
            ),
          },
        }));
      },

      deleteItem: async (listId, itemId) => {
        await api.deleteItem(itemId);
        set((s) => ({
          items: {
            ...s.items,
            [listId]: (s.items[listId] || []).filter((i) => i.id !== itemId),
          },
        }));
      },

      resetList: async (listId) => {
        await api.resetList(listId);
        set((s) => ({
          items: {
            ...s.items,
            [listId]: (s.items[listId] || []).map((i) => ({
              ...i,
              is_checked: 0,
            })),
          },
        }));
      },

      setActiveList: (id) => set({ activeListId: id }),
    }),
    {
      name: 'omni-grocery',
      partialize: (s) => ({ activeListId: s.activeListId }),
    },
  ),
);

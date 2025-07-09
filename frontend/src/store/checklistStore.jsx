import { create } from "zustand";
import {
  getChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem
} from "../api/checklistItems";

const useChecklistStore = create((set) => ({
  items: [],
  fetchChecklist: async (cardId) => {
    const res = await getChecklistItems(cardId);
    set({ items: res.data });
  },
  addChecklistItem: async (data) => {
    const res = await createChecklistItem(data);
    set((state) => ({ items: [...state.items, res.data] }));
    return res.data;
  },
  updateChecklistItem: async (id, data) => {
    const res = await updateChecklistItem(id, data);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? res.data : i)),
    }));
    return res.data;
  },
  deleteChecklistItem: async (id) => {
    await deleteChecklistItem(id);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },
}));

export default useChecklistStore;

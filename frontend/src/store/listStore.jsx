import { create } from "zustand";
import { getLists, createList, updateList, deleteList } from "../api/lists";

const useListStore = create((set, get) => ({
  lists: [],
  fetchLists: async (boardId) => {
    const res = await getLists(boardId);
    // Always sort lists by order when fetching!
    set({ lists: res.data.sort((a, b) => a.order - b.order) });
  },
  addList: async (data) => {
    const res = await createList(data);
    set((state) => ({ lists: [...state.lists, res.data] }));
    return res.data;
  },
  updateList: async (listId, data) => {
    const res = await updateList(listId, data);
    set((state) => ({
      lists: state.lists.map((l) => (l.id === listId ? res.data : l)),
    }));
    return res.data;
  },
  deleteList: async (listId) => {
    await deleteList(listId);
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== listId),
    }));
  },
  setLists: (lists) => set({ lists }),  // <--- for reordering in-memory
}));

export default useListStore;

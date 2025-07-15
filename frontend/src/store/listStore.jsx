import { create } from "zustand"
import { getLists, createList, updateList, deleteList } from "../api/lists"

const useListStore = create((set, get) => ({
  lists: [],

  fetchLists: async (boardId) => {
    try {
      const res = await getLists(boardId)
      set({ lists: res.data })
    } catch (error) {
      console.error("Error fetching lists:", error)
    }
  },

  setLists: (lists) => set({ lists }),

  addList: async (data) => {
    try {
      const res = await createList(data)
      set((state) => ({ lists: [...state.lists, res.data] }))
      return res.data
    } catch (error) {
      console.error("Error adding list:", error)
      throw error
    }
  },

  updateList: async (listId, data) => {
    try {
      const res = await updateList(listId, data)
      set((state) => ({
        lists: state.lists.map((list) => (list.id === listId ? res.data : list)),
      }))
      return res.data
    } catch (error) {
      console.error("Error updating list:", error)
      throw error
    }
  },

  deleteList: async (listId) => {
    try {
      await deleteList(listId)
      set((state) => ({
        lists: state.lists.filter((list) => list.id !== listId),
      }))
    } catch (error) {
      console.error("Error deleting list:", error)
      throw error
    }
  },
}))

export default useListStore

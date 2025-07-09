// src/store/boardStore.jsx
import { create } from "zustand";
import { getBoards, createBoard, updateBoard, deleteBoard } from "../api/boards";

const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoardId: null,
  fetchBoards: async () => {
    const res = await getBoards();
    set({ boards: res.data });
  },
  setCurrentBoard: (id) => set({ currentBoardId: id }),
  deleteBoard: async (id) => {
    await deleteBoard(id);
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
      currentBoardId: state.currentBoardId === id ? null : state.currentBoardId,
    }));
  },
  getCurrentBoard: () => {
    const state = get();
    if (!state.currentBoardId) return null;
    return state.boards.find(b => b.id === state.currentBoardId) || null;
  },
  addBoard: async (data) => {
    const res = await createBoard(data);
    set((state) => ({ boards: [...state.boards, res.data] }));
    return res.data;
  },
  editBoard: async (boardId, data) => {
    const res = await updateBoard(boardId, data);
    set((state) => ({
      boards: state.boards.map((b) => (b.id === boardId ? res.data : b)),
      currentBoardId: state.currentBoardId === boardId ? boardId : state.currentBoardId,
    }));
    return res.data;
  },
  // Helper to get all boards for the user
  getUserBoards: () => get().boards,
  canEditBoard: () => true, // (if you want permissions, implement logic here)
}));
export default useBoardStore;

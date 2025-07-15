// src/store/boardStore.jsx
import { create } from "zustand";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  updateBoardMemberRole
} from "../api/boards";

const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoardId: null,

  // Fetch all boards
  fetchBoards: async () => {
    const res = await getBoards();
    set({ boards: res.data });
  },

  // Set which board is currently open/selected
  setCurrentBoard: (id) => set({ currentBoardId: id }),

  // Delete a board
  deleteBoard: async (id) => {
    await deleteBoard(id);
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
      currentBoardId: state.currentBoardId === id ? null : state.currentBoardId,
    }));
  },

  // Get the currently selected board (by id)
  getCurrentBoard: () => {
    const state = get();
    if (!state.currentBoardId) return null;
    return state.boards.find((b) => b.id === state.currentBoardId) || null;
  },

  // Create/add a new board
  addBoard: async (data) => {
    const res = await createBoard(data);
    set((state) => ({ boards: [...state.boards, res.data] }));
    return res.data;
  },

  // Edit/update a board
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

  // Permission checker (implement your logic as needed)
  canEditBoard: () => true,

  // Update member role (promote/demote member/admin, only owner/admin allowed)
  updateMemberRole: async (boardId, memberId, newRole) => {
    try {
      await updateBoardMemberRole(boardId, memberId, newRole);
      // Re-fetch all boards to update the UI (optional, but recommended)
      await get().fetchBoards();
    } catch (error) {
      throw error;
    }
  },
}));

export default useBoardStore;

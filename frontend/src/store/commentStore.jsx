import { create } from "zustand";
import {
  getComments,
  createComment,
  deleteComment,
} from "../api/comments";

const useCommentStore = create((set) => ({
  comments: [],
  fetchComments: async (cardId) => {
    const res = await getComments(cardId);
    set({ comments: res.data });
  },
  addComment: async (data) => {
    const res = await createComment(data);
    set((state) => ({ comments: [...state.comments, res.data] }));
    return res.data;
  },
  deleteComment: async (id) => {
    await deleteComment(id);
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
    }));
  },
}));

export default useCommentStore;

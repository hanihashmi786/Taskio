import { create } from "zustand";
import { getCards, createCard, updateCard, deleteCard } from "../api/cards";
import { getComments, createComment, deleteComment } from "../api/comments";

const useCardStore = create((set, get) => ({
  cards: {}, // {listId: [cards]}
  comments: {}, // {cardId: [comments]}

  fetchCards: async (listId) => {
    const res = await getCards(listId);
    set((state) => ({
      cards: { ...state.cards, [listId]: res.data }
    }));
  },

  addCard: async (data) => {
    const res = await createCard(data);
    set((state) => {
      const listId = res.data.list;
      return {
        cards: {
          ...state.cards,
          [listId]: [...(state.cards[listId] || []), res.data]
        }
      };
    });
    return res.data;
  },

  updateCard: async (cardId, data) => {
    const res = await updateCard(cardId, data);
    set((state) => {
      const listId = res.data.list;
      return {
        cards: {
          ...state.cards,
          [listId]: (state.cards[listId] || []).map((c) =>
            c.id === cardId ? res.data : c
          )
        }
      };
    });
    return res.data;
  },

  deleteCard: async (cardId, listId) => {
    await deleteCard(cardId);
    set((state) => ({
      cards: {
        ...state.cards,
        [listId]: (state.cards[listId] || []).filter((c) => c.id !== cardId)
      }
    }));
  },

  setCardsForList: (listId, cards) => {
    set((state) => ({
      cards: {
        ...state.cards,
        [listId]: cards,
      },
    }));
  },

  // Comments
  fetchComments: async (cardId) => {
    const res = await getComments(cardId);
    set((state) => ({
      comments: { ...state.comments, [cardId]: res.data }
    }));
  },
  addComment: async (cardId, data) => {
    const res = await createComment(cardId, data);
    set((state) => ({
      comments: {
        ...state.comments,
        [cardId]: [...(state.comments[cardId] || []), res.data]
      }
    }));
    return res.data;
  },
  deleteComment: async (cardId, commentId) => {
    await deleteComment(commentId);
    set((state) => ({
      comments: {
        ...state.comments,
        [cardId]: (state.comments[cardId] || []).filter(
          (c) => c.id !== commentId
        )
      }
    }));
  },
}));

export default useCardStore;

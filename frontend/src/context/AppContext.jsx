"use client"

import { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import { getBoards, createBoard, updateBoard, deleteBoard } from "../api/boards"
import { getLists, createList, updateList, deleteList } from "../api/lists"
import { getCards, createCard, updateCard, deleteCard } from "../api/cards"
import { getComments, createComment, deleteComment } from "../api/comments"

const AppContext = createContext()

// Initial state
const initialState = {
  theme: "light",
  user: {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  boards: [],
  currentBoard: null,
  currentBoardId: null,
  lists: [],
  cards: {},
  comments: {},
  checklists: {},
  sidebarCollapsed: false,
  showModal: false,
  modalType: null,
  modalData: null,
  notification: null,
  notifications: [],
  alerts: [],
  draggedCard: null,
  draggedList: null,
  loading: {
    boards: false,
    lists: false,
    cards: false,
    comments: false,
  },
  errors: {
    boards: null,
    lists: null,
    cards: null,
    comments: null,
  },
}

// Action types
const ACTIONS = {
  SET_THEME: "SET_THEME",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_BOARDS: "SET_BOARDS",
  ADD_BOARD: "ADD_BOARD",
  UPDATE_BOARD: "UPDATE_BOARD",
  DELETE_BOARD: "DELETE_BOARD",
  SET_CURRENT_BOARD: "SET_CURRENT_BOARD",
  SET_CURRENT_BOARD_ID: "SET_CURRENT_BOARD_ID",
  ADD_LIST: "ADD_LIST",
  UPDATE_LIST: "UPDATE_LIST",
  DELETE_LIST: "DELETE_LIST",
  SET_LISTS: "SET_LISTS",
  ADD_CARD: "ADD_CARD",
  UPDATE_CARD: "UPDATE_CARD",
  DELETE_CARD: "DELETE_CARD",
  MOVE_CARD: "MOVE_CARD",
  MOVE_LIST: "MOVE_LIST",
  SET_CARDS_FOR_LIST: "SET_CARDS_FOR_LIST",
  ADD_COMMENT: "ADD_COMMENT",
  DELETE_COMMENT: "DELETE_COMMENT",
  SET_COMMENTS: "SET_COMMENTS",
  ADD_CHECKLIST: "ADD_CHECKLIST",
  UPDATE_CHECKLIST_ITEM: "UPDATE_CHECKLIST_ITEM",
  DELETE_CHECKLIST_ITEM: "DELETE_CHECKLIST_ITEM",
  SHOW_MODAL: "SHOW_MODAL",
  HIDE_MODAL: "HIDE_MODAL",
  SHOW_NOTIFICATION: "SHOW_NOTIFICATION",
  HIDE_NOTIFICATION: "HIDE_NOTIFICATION",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  MARK_NOTIFICATION_READ: "MARK_NOTIFICATION_READ",
  CLEAR_NOTIFICATIONS: "CLEAR_NOTIFICATIONS",
  ADD_ALERT: "ADD_ALERT",
  REMOVE_ALERT: "REMOVE_ALERT",
  UPDATE_USER: "UPDATE_USER",
  SET_DRAGGED_CARD: "SET_DRAGGED_CARD",
  SET_DRAGGED_LIST: "SET_DRAGGED_LIST",
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_THEME:
      return { ...state, theme: action.payload }

    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      }

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value },
      }

    case ACTIONS.SET_BOARDS:
      return { ...state, boards: action.payload, loading: { ...state.loading, boards: false } }

    case ACTIONS.ADD_BOARD:
      return { ...state, boards: [...state.boards, action.payload] }

    case ACTIONS.UPDATE_BOARD:
      return {
        ...state,
        boards: state.boards.map((board) => (board.id === action.payload.id ? { ...board, ...action.payload } : board)),
        currentBoard:
          state.currentBoard?.id === action.payload.id
            ? { ...state.currentBoard, ...action.payload }
            : state.currentBoard,
      }

    case ACTIONS.DELETE_BOARD:
      return {
        ...state,
        boards: state.boards.filter((board) => board.id !== action.payload),
        currentBoard: state.currentBoard?.id === action.payload ? null : state.currentBoard,
        currentBoardId: state.currentBoardId === action.payload ? null : state.currentBoardId,
      }

    case ACTIONS.SET_CURRENT_BOARD:
      return { ...state, currentBoard: action.payload }

    case ACTIONS.SET_CURRENT_BOARD_ID:
      return { ...state, currentBoardId: action.payload }

    case ACTIONS.SET_LISTS:
      return { ...state, lists: action.payload, loading: { ...state.loading, lists: false } }

    case ACTIONS.ADD_LIST:
      return {
        ...state,
        lists: [...state.lists, action.payload],
      }

    case ACTIONS.UPDATE_LIST:
      return {
        ...state,
        lists: state.lists.map((list) => (list.id === action.payload.id ? action.payload : list)),
      }

    case ACTIONS.DELETE_LIST:
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== action.payload),
      }

    case ACTIONS.SET_CARDS_FOR_LIST:
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.payload.listId]: action.payload.cards,
        },
        loading: { ...state.loading, cards: false },
      }

    case ACTIONS.ADD_CARD:
      const { listId, card } = action.payload
      return {
        ...state,
        cards: {
          ...state.cards,
          [listId]: [...(state.cards[listId] || []), card],
        },
      }

    case ACTIONS.UPDATE_CARD:
      const { listId: updateListId, card: updatedCard } = action.payload
      return {
        ...state,
        cards: {
          ...state.cards,
          [updateListId]: (state.cards[updateListId] || []).map((c) => (c.id === updatedCard.id ? updatedCard : c)),
        },
      }

    case ACTIONS.DELETE_CARD:
      const { listId: deleteListId, cardId } = action.payload
      return {
        ...state,
        cards: {
          ...state.cards,
          [deleteListId]: (state.cards[deleteListId] || []).filter((c) => c.id !== cardId),
        },
      }

    case ACTIONS.MOVE_CARD:
      const { cardId: moveCardId, sourceListId, targetListId, targetIndex } = action.payload
      let cardToMove = null

      // Find the card to move
      const sourceCards = state.cards[sourceListId] || []
      cardToMove = sourceCards.find((card) => card.id === moveCardId)

      if (!cardToMove) return state

      // Remove from source list
      const newSourceCards = sourceCards.filter((card) => card.id !== moveCardId)

      // Add to target list
      const targetCards = [...(state.cards[targetListId] || [])]
      targetCards.splice(targetIndex, 0, { ...cardToMove, list: targetListId })

      return {
        ...state,
        cards: {
          ...state.cards,
          [sourceListId]: newSourceCards,
          [targetListId]: targetCards,
        },
      }

    case ACTIONS.SET_COMMENTS:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.cardId]: action.payload.comments,
        },
        loading: { ...state.loading, comments: false },
      }

    case ACTIONS.ADD_COMMENT:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.cardId]: [...(state.comments[action.payload.cardId] || []), action.payload.comment],
        },
      }

    case ACTIONS.DELETE_COMMENT:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.cardId]: (state.comments[action.payload.cardId] || []).filter(
            (c) => c.id !== action.payload.commentId,
          ),
        },
      }

    case ACTIONS.SHOW_MODAL:
      return {
        ...state,
        showModal: true,
        modalType: action.payload.type,
        modalData: action.payload.data,
      }

    case ACTIONS.HIDE_MODAL:
      return {
        ...state,
        showModal: false,
        modalType: null,
        modalData: null,
      }

    case ACTIONS.SHOW_NOTIFICATION:
      return { ...state, notification: action.payload }

    case ACTIONS.HIDE_NOTIFICATION:
      return { ...state, notification: null }

    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      }

    case ACTIONS.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map((notif) =>
          notif.id === action.payload ? { ...notif, read: true } : notif,
        ),
      }

    case ACTIONS.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] }

    case ACTIONS.ADD_ALERT:
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      }

    case ACTIONS.REMOVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      }

    case ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } }

    case ACTIONS.SET_DRAGGED_CARD:
      return { ...state, draggedCard: action.payload }

    case ACTIONS.SET_DRAGGED_LIST:
      return { ...state, draggedList: action.payload }

    default:
      return state
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("trello-theme")
    if (savedTheme) {
      dispatch({ type: ACTIONS.SET_THEME, payload: savedTheme })
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("trello-theme", state.theme)
  }, [state.theme])

  // Memoized action creators to prevent unnecessary re-renders
  const actions = {
    // Theme actions
    setTheme: useCallback((theme) => dispatch({ type: ACTIONS.SET_THEME, payload: theme }), []),
    toggleSidebar: useCallback(() => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }), []),

    // Loading and error actions
    setLoading: useCallback((key, value) => dispatch({ type: ACTIONS.SET_LOADING, payload: { key, value } }), []),
    setError: useCallback((key, value) => dispatch({ type: ACTIONS.SET_ERROR, payload: { key, value } }), []),

    // Board actions
    fetchBoards: useCallback(async () => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "boards", value: true } })
      dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "boards", value: null } })

      try {
        const response = await getBoards()
        dispatch({ type: ACTIONS.SET_BOARDS, payload: response.data })
        return response.data
      } catch (error) {
        console.error("Error fetching boards:", error)
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "boards", value: error.message } })
        actions.showAlert({
          type: "error",
          title: "Error Loading Boards",
          message: "Failed to load boards. Please try again.",
        })
        return []
      }
    }, []),

    addBoard: useCallback(async (boardData) => {
      try {
        const response = await createBoard(boardData)
        dispatch({ type: ACTIONS.ADD_BOARD, payload: response.data })
        actions.showAlert({
          type: "success",
          title: "Board Created",
          message: `${response.data.title} has been created successfully!`,
        })
        return response.data
      } catch (error) {
        console.error("Error creating board:", error)
        actions.showAlert({
          type: "error",
          title: "Error Creating Board",
          message: "Failed to create board. Please try again.",
        })
        throw error
      }
    }, []),

    updateBoard: useCallback(async (boardId, boardData) => {
      try {
        const response = await updateBoard(boardId, boardData)
        dispatch({ type: ACTIONS.UPDATE_BOARD, payload: response.data })
        actions.showAlert({
          type: "success",
          title: "Board Updated",
          message: "Board has been updated successfully!",
        })
        return response.data
      } catch (error) {
        console.error("Error updating board:", error)
        actions.showAlert({
          type: "error",
          title: "Error Updating Board",
          message: "Failed to update board. Please try again.",
        })
        throw error
      }
    }, []),

    editBoard: useCallback(async (boardId, data) => {
      return actions.updateBoard(boardId, data)
    }, []),

    deleteBoard: useCallback(async (boardId) => {
      try {
        await deleteBoard(boardId)
        dispatch({ type: ACTIONS.DELETE_BOARD, payload: boardId })
        actions.showAlert({
          type: "success",
          title: "Board Deleted",
          message: "Board has been deleted successfully!",
        })
      } catch (error) {
        console.error("Error deleting board:", error)
        actions.showAlert({
          type: "error",
          title: "Error Deleting Board",
          message: "Failed to delete board. Please try again.",
        })
        throw error
      }
    }, []),

    setCurrentBoard: useCallback((board) => dispatch({ type: ACTIONS.SET_CURRENT_BOARD, payload: board }), []),
    setCurrentBoardId: useCallback((boardId) => dispatch({ type: ACTIONS.SET_CURRENT_BOARD_ID, payload: boardId }), []),

    getCurrentBoard: useCallback(() => {
      if (!state.currentBoardId) return null
      return state.boards.find((b) => b.id === state.currentBoardId) || null
    }, [state.currentBoardId, state.boards]),

    getUserBoards: useCallback(() => state.boards, [state.boards]),
    canEditBoard: useCallback(() => true, []),

    // List actions
    fetchLists: useCallback(async (boardId) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "lists", value: true } })
      dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "lists", value: null } })

      try {
        const response = await getLists(boardId)
        dispatch({ type: ACTIONS.SET_LISTS, payload: response.data })
        return response.data
      } catch (error) {
        console.error("Error fetching lists:", error)
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "lists", value: error.message } })
        actions.showAlert({
          type: "error",
          title: "Error Loading Lists",
          message: "Failed to load lists. Please try again.",
        })
        return []
      }
    }, []),

    setLists: useCallback((lists) => dispatch({ type: ACTIONS.SET_LISTS, payload: lists }), []),

    addList: useCallback(async (data) => {
      try {
        const response = await createList(data)
        dispatch({ type: ACTIONS.ADD_LIST, payload: response.data })
        actions.showAlert({
          type: "success",
          title: "List Added",
          message: `${response.data.title} has been added!`,
        })
        return response.data
      } catch (error) {
        console.error("Error adding list:", error)
        actions.showAlert({
          type: "error",
          title: "Error Adding List",
          message: "Failed to add list. Please try again.",
        })
        throw error
      }
    }, []),

    updateList: useCallback(async (listId, data) => {
      try {
        const response = await updateList(listId, data)
        dispatch({ type: ACTIONS.UPDATE_LIST, payload: response.data })
        return response.data
      } catch (error) {
        console.error("Error updating list:", error)
        actions.showAlert({
          type: "error",
          title: "Error Updating List",
          message: "Failed to update list. Please try again.",
        })
        throw error
      }
    }, []),

    deleteList: useCallback(async (listId) => {
      try {
        await deleteList(listId)
        dispatch({ type: ACTIONS.DELETE_LIST, payload: listId })
        actions.showAlert({
          type: "success",
          title: "List Deleted",
          message: "List has been deleted successfully!",
        })
      } catch (error) {
        console.error("Error deleting list:", error)
        actions.showAlert({
          type: "error",
          title: "Error Deleting List",
          message: "Failed to delete list. Please try again.",
        })
        throw error
      }
    }, []),

    // Card actions
    fetchCards: useCallback(async (listId) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "cards", value: true } })
      dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "cards", value: null } })

      try {
        const response = await getCards(listId)
        dispatch({ type: ACTIONS.SET_CARDS_FOR_LIST, payload: { listId, cards: response.data } })
        return response.data
      } catch (error) {
        console.error("Error fetching cards:", error)
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "cards", value: error.message } })
        actions.showAlert({
          type: "error",
          title: "Error Loading Cards",
          message: "Failed to load cards. Please try again.",
        })
        return []
      }
    }, []),

    setCardsForList: useCallback((listId, cards) => {
      dispatch({ type: ACTIONS.SET_CARDS_FOR_LIST, payload: { listId, cards } })
    }, []),

    addCard: useCallback(async (data) => {
      try {
        const response = await createCard(data)
        dispatch({ type: ACTIONS.ADD_CARD, payload: { listId: response.data.list, card: response.data } })
        actions.showAlert({
          type: "success",
          title: "Card Added",
          message: `${response.data.title} has been added!`,
        })

        // Add notification for card assignment
        if (response.data.assignees && response.data.assignees.length > 0) {
          actions.addNotification({
            type: "card_assigned",
            title: "Card Assigned",
            message: `You were assigned to "${response.data.title}"`,
            boardId: data.boardId,
            cardId: response.data.id,
          })
        }

        return response.data
      } catch (error) {
        console.error("Error adding card:", error)
        actions.showAlert({
          type: "error",
          title: "Error Adding Card",
          message: "Failed to add card. Please try again.",
        })
        throw error
      }
    }, []),

    updateCard: useCallback(async (cardId, data) => {
      try {
        const response = await updateCard(cardId, data)
        dispatch({ type: ACTIONS.UPDATE_CARD, payload: { listId: response.data.list, card: response.data } })
        actions.showAlert({
          type: "success",
          title: "Card Updated",
          message: "Card has been updated successfully!",
        })
        return response.data
      } catch (error) {
        console.error("Error updating card:", error)
        actions.showAlert({
          type: "error",
          title: "Error Updating Card",
          message: "Failed to update card. Please try again.",
        })
        throw error
      }
    }, []),

    deleteCard: useCallback(async (cardId, listId) => {
      try {
        await deleteCard(cardId)
        dispatch({ type: ACTIONS.DELETE_CARD, payload: { listId, cardId } })
        actions.showAlert({
          type: "success",
          title: "Card Deleted",
          message: "Card has been deleted successfully!",
        })
      } catch (error) {
        console.error("Error deleting card:", error)
        actions.showAlert({
          type: "error",
          title: "Error Deleting Card",
          message: "Failed to delete card. Please try again.",
        })
        throw error
      }
    }, []),

    moveCard: useCallback(async (cardId, sourceListId, targetListId, targetIndex) => {
      // Optimistically update UI
      dispatch({
        type: ACTIONS.MOVE_CARD,
        payload: { cardId, sourceListId, targetListId, targetIndex },
      })

      try {
        // Update card's list in backend
        await updateCard(cardId, { list: targetListId })

        // Add notification for card move
        actions.addNotification({
          type: "card_moved",
          title: "Card Moved",
          message: "A card has been moved to a different list",
          cardId,
        })
      } catch (error) {
        console.error("Error moving card:", error)
        // Revert the optimistic update by refetching
        actions.fetchCards(sourceListId)
        actions.fetchCards(targetListId)
        actions.showAlert({
          type: "error",
          title: "Error Moving Card",
          message: "Failed to move card. Please try again.",
        })
      }
    }, []),

    // Comment actions
    fetchComments: useCallback(async (cardId) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "comments", value: true } })
      dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "comments", value: null } })

      try {
        const response = await getComments(cardId)
        dispatch({ type: ACTIONS.SET_COMMENTS, payload: { cardId, comments: response.data } })
        return response.data
      } catch (error) {
        console.error("Error fetching comments:", error)
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "comments", value: error.message } })
        return []
      }
    }, []),

    addComment: useCallback(async (cardId, data) => {
      try {
        const response = await createComment(cardId, data)
        dispatch({ type: ACTIONS.ADD_COMMENT, payload: { cardId, comment: response.data } })
        return response.data
      } catch (error) {
        console.error("Error adding comment:", error)
        actions.showAlert({
          type: "error",
          title: "Error Adding Comment",
          message: "Failed to add comment. Please try again.",
        })
        throw error
      }
    }, []),

    deleteComment: useCallback(async (cardId, commentId) => {
      try {
        await deleteComment(commentId)
        dispatch({ type: ACTIONS.DELETE_COMMENT, payload: { cardId, commentId } })
      } catch (error) {
        console.error("Error deleting comment:", error)
        actions.showAlert({
          type: "error",
          title: "Error Deleting Comment",
          message: "Failed to delete comment. Please try again.",
        })
        throw error
      }
    }, []),

    // Modal actions
    showModal: useCallback((type, data = null) => {
      dispatch({ type: ACTIONS.SHOW_MODAL, payload: { type, data } })
    }, []),

    hideModal: useCallback(() => dispatch({ type: ACTIONS.HIDE_MODAL }), []),

    // Notification actions
    showNotification: useCallback((notification) => {
      dispatch({ type: ACTIONS.SHOW_NOTIFICATION, payload: notification })
      setTimeout(() => {
        dispatch({ type: ACTIONS.HIDE_NOTIFICATION })
      }, 3000)
    }, []),

    // Enhanced alert system
    showAlert: useCallback((alert) => {
      const newAlert = {
        ...alert,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }
      dispatch({ type: ACTIONS.ADD_ALERT, payload: newAlert })

      // Auto remove after duration
      setTimeout(() => {
        actions.removeAlert(newAlert.id)
      }, alert.duration || 5000)
    }, []),

    removeAlert: useCallback((alertId) => {
      dispatch({ type: ACTIONS.REMOVE_ALERT, payload: alertId })
    }, []),

    // Notification system
    addNotification: useCallback((notification) => {
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: newNotification })
    }, []),

    markNotificationRead: useCallback((notificationId) => {
      dispatch({ type: ACTIONS.MARK_NOTIFICATION_READ, payload: notificationId })
    }, []),

    clearNotifications: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_NOTIFICATIONS })
    }, []),

    // User actions
    updateUser: useCallback((userData) => {
      dispatch({ type: ACTIONS.UPDATE_USER, payload: userData })
      actions.showAlert({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been updated successfully!",
      })
    }, []),

    // Drag and drop actions
    setDraggedCard: useCallback((card) => dispatch({ type: ACTIONS.SET_DRAGGED_CARD, payload: card }), []),
    setDraggedList: useCallback((list) => dispatch({ type: ACTIONS.SET_DRAGGED_LIST, payload: list }), []),
  }

  const contextValue = {
    ...state,
    ...actions,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

// Custom hook with proper error handling
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

// Export individual hooks for compatibility with existing store patterns
export const useBoardStore = () => {
  const context = useApp()
  return {
    boards: context.boards,
    currentBoardId: context.currentBoardId,
    fetchBoards: context.fetchBoards,
    setCurrentBoard: context.setCurrentBoardId,
    deleteBoard: context.deleteBoard,
    getCurrentBoard: context.getCurrentBoard,
    addBoard: context.addBoard,
    editBoard: context.editBoard,
    getUserBoards: context.getUserBoards,
    canEditBoard: context.canEditBoard,
    loading: context.loading.boards,
    error: context.errors.boards,
  }
}

export const useListStore = () => {
  const context = useApp()
  return {
    lists: context.lists,
    fetchLists: context.fetchLists,
    setLists: context.setLists,
    addList: context.addList,
    updateList: context.updateList,
    deleteList: context.deleteList,
    loading: context.loading.lists,
    error: context.errors.lists,
  }
}

export const useCardStore = () => {
  const context = useApp()
  return {
    cards: context.cards,
    comments: context.comments,
    fetchCards: context.fetchCards,
    addCard: context.addCard,
    updateCard: context.updateCard,
    deleteCard: context.deleteCard,
    setCardsForList: context.setCardsForList,
    fetchComments: context.fetchComments,
    addComment: context.addComment,
    deleteComment: context.deleteComment,
    loading: context.loading.cards,
    error: context.errors.cards,
  }
}

export const useChecklistStore = () => {
  const context = useApp()
  return {
    items: [],
    checklists: [],
    fetchChecklist: async () => [],
    fetchChecklists: async () => [],
    addChecklist: async (data) => data,
    addChecklistItem: async (data) => data,
    updateChecklistItem: async (id, data) => data,
    deleteChecklistItem: async () => {},
  }
}

export const useCommentStore = () => {
  const context = useApp()
  return {
    comments: context.comments,
    fetchComments: context.fetchComments,
    addComment: context.addComment,
    deleteComment: context.deleteComment,
    loading: context.loading.comments,
    error: context.errors.comments,
  }
}

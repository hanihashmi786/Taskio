"use client"

import { createContext, useContext, useReducer, useEffect } from "react"

const AppContext = createContext()

// Initial state
const initialState = {
  theme: "light",
  user: {
    name: "",
    email: "",
    username: "",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
  },
  boards: [],
  currentBoard: null,
  sidebarCollapsed: false,
  showModal: false,
  modalType: null,
  modalData: null,
  notification: null,
  draggedCard: null,
  draggedList: null,
}

// Sample data
const sampleBoards = [
  {
    id: "1",
    title: "Project Alpha",
    description: "Main project board",
    color: "bg-blue-500",
    icon: "🚀",
    createdAt: new Date().toISOString(),
    lists: [
      {
        id: "list-1",
        title: "To Do",
        cards: [
          {
            id: "card-1",
            title: "Design landing page",
            description: "Create wireframes and mockups for the new landing page",
            labels: ["Design", "High Priority"],
            dueDate: "2024-01-15",
            assignee: "John Doe",
            createdAt: new Date().toISOString(),
          },
          {
            id: "card-2",
            title: "Set up database",
            description: "Configure PostgreSQL database with initial schema",
            labels: ["Backend"],
            dueDate: "2024-01-12",
            assignee: "Jane Smith",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: "list-2",
        title: "In Progress",
        cards: [
          {
            id: "card-3",
            title: "Implement authentication",
            description: "Add user login and registration functionality",
            labels: ["Backend", "Security"],
            dueDate: "2024-01-20",
            assignee: "John Doe",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: "list-3",
        title: "Done",
        cards: [
          {
            id: "card-4",
            title: "Project setup",
            description: "Initialize project structure and dependencies",
            labels: ["Setup"],
            dueDate: "2024-01-05",
            assignee: "John Doe",
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Marketing Campaign",
    description: "Q1 marketing initiatives",
    color: "bg-green-500",
    icon: "📈",
    createdAt: new Date().toISOString(),
    lists: [
      {
        id: "list-4",
        title: "Planning",
        cards: [
          {
            id: "card-5",
            title: "Market research",
            description: "Analyze target audience and competitors",
            labels: ["Research"],
            dueDate: "2024-01-18",
            assignee: "Sarah Wilson",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: "list-5",
        title: "Execution",
        cards: [],
      },
      {
        id: "list-6",
        title: "Review",
        cards: [],
      },
    ],
  },
  {
    id: "3",
    title: "Personal Tasks",
    description: "My personal todo list",
    color: "bg-purple-500",
    icon: "📝",
    createdAt: new Date().toISOString(),
    lists: [
      {
        id: "list-7",
        title: "Today",
        cards: [
          {
            id: "card-6",
            title: "Review code",
            description: "Review pull requests from team members",
            labels: ["Code Review"],
            dueDate: "2024-01-10",
            assignee: "John Doe",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: "list-8",
        title: "This Week",
        cards: [],
      },
      {
        id: "list-9",
        title: "Completed",
        cards: [],
      },
    ],
  },
]

// Action types
const ACTIONS = {
  SET_THEME: "SET_THEME",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  SET_BOARDS: "SET_BOARDS",
  ADD_BOARD: "ADD_BOARD",
  UPDATE_BOARD: "UPDATE_BOARD",
  DELETE_BOARD: "DELETE_BOARD",
  SET_CURRENT_BOARD: "SET_CURRENT_BOARD",
  ADD_LIST: "ADD_LIST",
  UPDATE_LIST: "UPDATE_LIST",
  DELETE_LIST: "DELETE_LIST",
  ADD_CARD: "ADD_CARD",
  UPDATE_CARD: "UPDATE_CARD",
  DELETE_CARD: "DELETE_CARD",
  MOVE_CARD: "MOVE_CARD",
  MOVE_LIST: "MOVE_LIST",
  SHOW_MODAL: "SHOW_MODAL",
  HIDE_MODAL: "HIDE_MODAL",
  SHOW_NOTIFICATION: "SHOW_NOTIFICATION",
  HIDE_NOTIFICATION: "HIDE_NOTIFICATION",
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

    case ACTIONS.SET_BOARDS:
      return { ...state, boards: action.payload }

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
      }

    case ACTIONS.SET_CURRENT_BOARD:
      return { ...state, currentBoard: action.payload }

    case ACTIONS.ADD_LIST:
      const boardWithNewList = state.boards.map((board) =>
        board.id === action.payload.boardId ? { ...board, lists: [...board.lists, action.payload.list] } : board,
      )
      return {
        ...state,
        boards: boardWithNewList,
        currentBoard:
          state.currentBoard?.id === action.payload.boardId
            ? { ...state.currentBoard, lists: [...state.currentBoard.lists, action.payload.list] }
            : state.currentBoard,
      }

    case ACTIONS.UPDATE_LIST:
      const boardsWithUpdatedList = state.boards.map((board) =>
        board.id === action.payload.boardId
          ? {
              ...board,
              lists: board.lists.map((list) => (list.id === action.payload.list.id ? action.payload.list : list)),
            }
          : board,
      )
      return {
        ...state,
        boards: boardsWithUpdatedList,
        currentBoard:
          state.currentBoard?.id === action.payload.boardId
            ? {
                ...state.currentBoard,
                lists: state.currentBoard.lists.map((list) =>
                  list.id === action.payload.list.id ? action.payload.list : list,
                ),
              }
            : state.currentBoard,
      }

    case ACTIONS.DELETE_LIST:
      const boardsWithoutList = state.boards.map((board) =>
        board.id === action.payload.boardId
          ? { ...board, lists: board.lists.filter((list) => list.id !== action.payload.listId) }
          : board,
      )
      return {
        ...state,
        boards: boardsWithoutList,
        currentBoard:
          state.currentBoard?.id === action.payload.boardId
            ? {
                ...state.currentBoard,
                lists: state.currentBoard.lists.filter((list) => list.id !== action.payload.listId),
              }
            : state.currentBoard,
      }

    case ACTIONS.ADD_CARD:
      const boardsWithNewCard = state.boards.map((board) =>
        board.id === action.payload.boardId
          ? {
              ...board,
              lists: board.lists.map((list) =>
                list.id === action.payload.listId ? { ...list, cards: [...list.cards, action.payload.card] } : list,
              ),
            }
          : board,
      )
      return {
        ...state,
        boards: boardsWithNewCard,
        currentBoard:
          state.currentBoard?.id === action.payload.boardId
            ? {
                ...state.currentBoard,
                lists: state.currentBoard.lists.map((list) =>
                  list.id === action.payload.listId ? { ...list, cards: [...list.cards, action.payload.card] } : list,
                ),
              }
            : state.currentBoard,
      }

    case ACTIONS.UPDATE_CARD:
      const boardsWithUpdatedCard = state.boards.map((board) =>
        board.id === action.payload.boardId
          ? {
              ...board,
              lists: board.lists.map((list) =>
                list.id === action.payload.listId
                  ? {
                      ...list,
                      cards: list.cards.map((card) =>
                        card.id === action.payload.card.id ? action.payload.card : card,
                      ),
                    }
                  : list,
              ),
            }
          : board,
      )
      return {
        ...state,
        boards: boardsWithUpdatedCard,
        currentBoard:
          state.currentBoard?.id === action.payload.boardId
            ? {
                ...state.currentBoard,
                lists: state.currentBoard.lists.map((list) =>
                  list.id === action.payload.listId
                    ? {
                        ...list,
                        cards: list.cards.map((card) =>
                          card.id === action.payload.card.id ? action.payload.card : card,
                        ),
                      }
                    : list,
                ),
              }
            : state.currentBoard,
      }

    case ACTIONS.DELETE_CARD:
      const boardsWithoutCard = state.boards.map((board) =>
        board.id === action.payload.boardId
          ? {
              ...board,
              lists: board.lists.map((list) =>
                list.id === action.payload.listId
                  ? { ...list, cards: list.cards.filter((card) => card.id !== action.payload.cardId) }
                  : list,
              ),
            }
          : board,
      )
      return {
        ...state,
        boards: boardsWithoutCard,
        currentBoard:
          state.currentBoard?.id === action.payload.boardId
            ? {
                ...state.currentBoard,
                lists: state.currentBoard.lists.map((list) =>
                  list.id === action.payload.listId
                    ? { ...list, cards: list.cards.filter((card) => card.id !== action.payload.cardId) }
                    : list,
                ),
              }
            : state.currentBoard,
      }

    case ACTIONS.MOVE_CARD:
      const { cardId, sourceListId, targetListId, boardId, targetIndex } = action.payload

      const boardsWithMovedCard = state.boards.map((board) => {
        if (board.id !== boardId) return board

        let cardToMove = null
        const updatedLists = board.lists.map((list) => {
          if (list.id === sourceListId) {
            cardToMove = list.cards.find((card) => card.id === cardId)
            return { ...list, cards: list.cards.filter((card) => card.id !== cardId) }
          }
          return list
        })

        return {
          ...board,
          lists: updatedLists.map((list) => {
            if (list.id === targetListId && cardToMove) {
              const newCards = [...list.cards]
              newCards.splice(targetIndex, 0, cardToMove)
              return { ...list, cards: newCards }
            }
            return list
          }),
        }
      })

      return {
        ...state,
        boards: boardsWithMovedCard,
        currentBoard:
          state.currentBoard?.id === boardId
            ? boardsWithMovedCard.find((board) => board.id === boardId)
            : state.currentBoard,
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("trello-theme")
    const savedBoards = localStorage.getItem("trello-boards")
    const savedUser = localStorage.getItem("trello-user")

    if (savedTheme) {
      dispatch({ type: ACTIONS.SET_THEME, payload: savedTheme })
    }

    if (savedBoards) {
      try {
        const boards = JSON.parse(savedBoards)
        dispatch({ type: ACTIONS.SET_BOARDS, payload: boards })
      } catch (error) {
        console.error("Error loading boards from localStorage:", error)
        dispatch({ type: ACTIONS.SET_BOARDS, payload: sampleBoards })
      }
    } else {
      dispatch({ type: ACTIONS.SET_BOARDS, payload: sampleBoards })
    }

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        // Map user data to expected structure
        const mappedUser = {
          name: user.name || user.username || "",
          email: user.email || "",
          username: user.username || "",
          avatar: user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        }
        dispatch({ type: ACTIONS.UPDATE_USER, payload: mappedUser })
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
      }
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("trello-theme", state.theme)
  }, [state.theme])

  useEffect(() => {
    localStorage.setItem("trello-boards", JSON.stringify(state.boards))
  }, [state.boards])

  useEffect(() => {
    localStorage.setItem("trello-user", JSON.stringify(state.user))
  }, [state.user])

  // Action creators
  const actions = {
    setTheme: (theme) => dispatch({ type: ACTIONS.SET_THEME, payload: theme }),
    toggleSidebar: () => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }),

    addBoard: (board) => {
      dispatch({ type: ACTIONS.ADD_BOARD, payload: board })
      actions.showNotification({ message: "Board created successfully!", type: "success" })
    },

    updateBoard: (board) => {
      dispatch({ type: ACTIONS.UPDATE_BOARD, payload: board })
      actions.showNotification({ message: "Board updated successfully!", type: "success" })
    },

    deleteBoard: (boardId) => {
      dispatch({ type: ACTIONS.DELETE_BOARD, payload: boardId })
      actions.showNotification({ message: "Board deleted successfully!", type: "success" })
    },

    setCurrentBoard: (board) => dispatch({ type: ACTIONS.SET_CURRENT_BOARD, payload: board }),

    addList: (boardId, list) => {
      dispatch({ type: ACTIONS.ADD_LIST, payload: { boardId, list } })
      actions.showNotification({ message: "List added successfully!", type: "success" })
    },

    updateList: (boardId, list) => {
      dispatch({ type: ACTIONS.UPDATE_LIST, payload: { boardId, list } })
    },

    deleteList: (boardId, listId) => {
      dispatch({ type: ACTIONS.DELETE_LIST, payload: { boardId, listId } })
      actions.showNotification({ message: "List deleted successfully!", type: "success" })
    },

    addCard: (boardId, listId, card) => {
      dispatch({ type: ACTIONS.ADD_CARD, payload: { boardId, listId, card } })
      actions.showNotification({ message: "Card added successfully!", type: "success" })
    },

    updateCard: (boardId, listId, card) => {
      dispatch({ type: ACTIONS.UPDATE_CARD, payload: { boardId, listId, card } })
      actions.showNotification({ message: "Card updated successfully!", type: "success" })
    },

    deleteCard: (boardId, listId, cardId) => {
      dispatch({ type: ACTIONS.DELETE_CARD, payload: { boardId, listId, cardId } })
      actions.showNotification({ message: "Card deleted successfully!", type: "success" })
    },

    moveCard: (cardId, sourceListId, targetListId, boardId, targetIndex) => {
      dispatch({
        type: ACTIONS.MOVE_CARD,
        payload: { cardId, sourceListId, targetListId, boardId, targetIndex },
      })
    },

    showModal: (type, data = null) => {
      dispatch({ type: ACTIONS.SHOW_MODAL, payload: { type, data } })
    },

    hideModal: () => dispatch({ type: ACTIONS.HIDE_MODAL }),

    showNotification: (notification) => {
      dispatch({ type: ACTIONS.SHOW_NOTIFICATION, payload: notification })
      setTimeout(() => {
        dispatch({ type: ACTIONS.HIDE_NOTIFICATION })
      }, 3000)
    },

    updateUser: (userData) => {
      dispatch({ type: ACTIONS.UPDATE_USER, payload: userData })
      actions.showNotification({ message: "Profile updated successfully!", type: "success" })
    },

    setDraggedCard: (card) => dispatch({ type: ACTIONS.SET_DRAGGED_CARD, payload: card }),
    setDraggedList: (list) => dispatch({ type: ACTIONS.SET_DRAGGED_LIST, payload: list }),
  }

  return <AppContext.Provider value={{ ...state, ...actions }}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

import { create } from "zustand"
import { persist } from "zustand/middleware"

const useBoardStore = create(
  persist(
    (set, get) => ({
      boards: [
        {
          id: "board-1",
          title: "My Project Board",
          description: "Main project management board",
          color: "bg-blue-500",
          icon: "📋",
          createdAt: new Date().toISOString(),
          createdBy: "current-user",
          members: [
            {
              id: "current-user",
              name: "Current User",
              email: "user@example.com",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
              role: "owner",
              addedAt: new Date().toISOString(),
            },
            {
              id: "member-1",
              name: "John Smith",
              email: "john@example.com",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
              role: "member",
              addedAt: new Date().toISOString(),
            },
          ],
          lists: [
            {
              id: "list-1",
              title: "To Do",
              cards: [
                {
                  id: "card-1",
                  title: "Design new landing page",
                  description: "Create wireframes and mockups for the new landing page design",
                  labels: [
                    { id: "design", name: "Design", color: "bg-blue-500", textColor: "text-white" },
                    { id: "high-priority", name: "High Priority", color: "bg-red-500", textColor: "text-white" },
                  ],
                  dueDate: "2024-01-20",
                  assignedTo: "member-1",
                  checklist: [
                    { id: "check-1", text: "Research competitors", completed: true },
                    { id: "check-2", text: "Create wireframes", completed: false },
                    { id: "check-3", text: "Design mockups", completed: false },
                  ],
                  comments: [
                    {
                      id: "comment-1",
                      text: "This looks great! Let's proceed with the wireframes.",
                      author: "John Smith",
                      authorId: "member-1",
                      timestamp: "2024-01-15T10:30:00Z",
                    },
                  ],
                  createdAt: "2024-01-10T09:00:00Z",
                },
                {
                  id: "card-2",
                  title: "Set up project repository",
                  description: "Initialize Git repository and set up project structure",
                  labels: [{ id: "development", name: "Development", color: "bg-green-500", textColor: "text-white" }],
                  dueDate: null,
                  assignedTo: "current-user",
                  checklist: [],
                  comments: [],
                  createdAt: "2024-01-10T10:00:00Z",
                },
              ],
            },
            {
              id: "list-2",
              title: "In Progress",
              cards: [
                {
                  id: "card-3",
                  title: "Implement user authentication",
                  description: "Add login and registration functionality with JWT tokens",
                  labels: [
                    { id: "development", name: "Development", color: "bg-green-500", textColor: "text-white" },
                    { id: "backend", name: "Backend", color: "bg-purple-500", textColor: "text-white" },
                  ],
                  dueDate: "2024-01-25",
                  assignedTo: "current-user",
                  checklist: [
                    { id: "check-4", text: "Set up authentication routes", completed: true },
                    { id: "check-5", text: "Implement JWT middleware", completed: false },
                  ],
                  comments: [],
                  createdAt: "2024-01-12T14:00:00Z",
                },
              ],
            },
            {
              id: "list-3",
              title: "Review",
              cards: [],
            },
            {
              id: "list-4",
              title: "Done",
              cards: [
                {
                  id: "card-4",
                  title: "Project planning and setup",
                  description: "Initial project setup and planning phase completed",
                  labels: [{ id: "planning", name: "Planning", color: "bg-yellow-500", textColor: "text-black" }],
                  dueDate: null,
                  assignedTo: null,
                  checklist: [],
                  comments: [],
                  createdAt: "2024-01-08T09:00:00Z",
                },
              ],
            },
          ],
        },
      ],
      currentBoardId: "board-1",
      currentUserId: "current-user",

      // Actions
      setCurrentBoard: (boardId) => set({ currentBoardId: boardId }),

      getCurrentUser: () => {
        const state = get()
        return {
          id: state.currentUserId,
          name: "Current User",
          email: "user@example.com",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        }
      },

      // Board access control
      getUserBoards: () => {
        const state = get()
        return state.boards.filter(
          (board) => Array.isArray(board.members) && board.members.some((member) => member.id === state.currentUserId)
        )
      },

      canAccessBoard: (boardId) => {
        const state = get()
        const board = state.boards.find((b) => b.id === boardId)
        if (!board || !Array.isArray(board.members)) return false
        return board.members.some((member) => member.id === state.currentUserId)
      },

      canEditBoard: (boardId) => {
        const state = get()
        const board = state.boards.find((b) => b.id === boardId)
        const userMember = board?.members.find((member) => member.id === state.currentUserId)
        return userMember?.role === "owner" || userMember?.role === "admin"
      },

      addBoard: (board) =>
        set((state) => {
          const newBoard = {
            ...board,
            createdBy: state.currentUserId,
            members: [
              {
                id: state.currentUserId,
                name: "Current User",
                email: "user@example.com",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
                role: "owner",
                addedAt: new Date().toISOString(),
              },
            ],
          }
          return {
            boards: [...state.boards, newBoard],
          }
        }),

      deleteBoard: (boardId) =>
        set((state) => {
          if (!state.canEditBoard(boardId)) return state
          return {
            boards: state.boards.filter((board) => board.id !== boardId),
            currentBoardId: state.currentBoardId === boardId ? null : state.currentBoardId,
          }
        }),

      // Member management
      addMemberToBoard: (boardId, memberData) =>
        set((state) => {
          if (!state.canEditBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    members: [
                      ...board.members,
                      {
                        ...memberData,
                        id: `member-${Date.now()}`,
                        role: "member",
                        addedAt: new Date().toISOString(),
                      },
                    ],
                  }
                : board,
            ),
          }
        }),

      removeMemberFromBoard: (boardId, memberId) =>
        set((state) => {
          if (!state.canEditBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    members: board.members.filter((member) => member.id !== memberId),
                  }
                : board,
            ),
          }
        }),

      updateMemberRole: (boardId, memberId, newRole) =>
        set((state) => {
          if (!state.canEditBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    members: board.members.map((member) =>
                      member.id === memberId ? { ...member, role: newRole } : member,
                    ),
                  }
                : board,
            ),
          }
        }),

      addList: (boardId, title) =>
        set((state) => {
          if (!state.canAccessBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    lists: [
                      ...board.lists,
                      {
                        id: `list-${Date.now()}`,
                        title,
                        cards: [],
                      },
                    ],
                  }
                : board,
            ),
          }
        }),

      updateList: (boardId, listId, updates) =>
        set((state) => {
          if (!state.canAccessBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    lists: board.lists.map((list) => (list.id === listId ? { ...list, ...updates } : list)),
                  }
                : board,
            ),
          }
        }),

      deleteList: (boardId, listId) =>
        set((state) => {
          if (!state.canAccessBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    lists: board.lists.filter((list) => list.id !== listId),
                  }
                : board,
            ),
          }
        }),

      moveList: (boardId, fromIndex, toIndex) =>
        set((state) => {
          if (!state.canAccessBoard(boardId)) return state
          return {
            boards: state.boards.map((board) => {
              if (board.id !== boardId) return board

              const newLists = [...board.lists]
              const [movedList] = newLists.splice(fromIndex, 1)
              newLists.splice(toIndex, 0, movedList)

              return {
                ...board,
                lists: newLists,
              }
            }),
          }
        }),

      addCard: (boardId, listId, cardData) =>
        set((state) => {
          if (!state.canAccessBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    lists: board.lists.map((list) =>
                      list.id === listId
                        ? {
                            ...list,
                            cards: [
                              ...list.cards,
                              {
                                id: `card-${Date.now()}`,
                                title: cardData.title,
                                description: cardData.description || "",
                                labels: cardData.labels || [],
                                dueDate: cardData.dueDate || null,
                                assignedTo: cardData.assignedTo || null,
                                checklist: cardData.checklist || [],
                                comments: [],
                                createdAt: new Date().toISOString(),
                              },
                            ],
                          }
                        : list,
                    ),
                  }
                : board,
            ),
          }
        }),

      updateCard: (boardId, listId, cardId, updates) =>
        set((state) => {
          if (!state.canAccessBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    lists: board.lists.map((list) =>
                      list.id === listId
                        ? {
                            ...list,
                            cards: list.cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
                          }
                        : list,
                    ),
                  }
                : board,
            ),
          }
        }),

      deleteCard: (boardId, listId, cardId) =>
        set((state) => {
          if (!state.canAccessBoard(boardId)) return state
          return {
            boards: state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    lists: board.lists.map((list) =>
                      list.id === listId
                        ? {
                            ...list,
                            cards: list.cards.filter((card) => card.id !== cardId),
                          }
                        : list,
                    ),
                  }
                : board,
            ),
          }
        }),

      moveCard: (boardId, cardId, sourceListId, destinationListId, destinationIndex) =>
        set((state) => {
          if (!state.canAccessBoard(boardId)) return state
          const board = state.boards.find((b) => b.id === boardId)
          if (!board) return state

          const sourceList = board.lists.find((l) => l.id === sourceListId)
          const destinationList = board.lists.find((l) => l.id === destinationListId)

          if (!sourceList || !destinationList) return state

          const cardToMove = sourceList.cards.find((c) => c.id === cardId)
          if (!cardToMove) return state

          return {
            boards: state.boards.map((b) =>
              b.id === boardId
                ? {
                    ...b,
                    lists: b.lists.map((list) => {
                      if (list.id === sourceListId) {
                        return {
                          ...list,
                          cards: list.cards.filter((c) => c.id !== cardId),
                        }
                      }
                      if (list.id === destinationListId) {
                        const newCards = [...list.cards]
                        newCards.splice(destinationIndex, 0, cardToMove)
                        return {
                          ...list,
                          cards: newCards,
                        }
                      }
                      return list
                    }),
                  }
                : b,
            ),
          }
        }),

      getCurrentBoard: () => {
        const state = get()
        const board = state.boards.find((board) => board.id === state.currentBoardId)
        return board && state.canAccessBoard(board.id) ? board : null
      },
    }),
    {
      name: "board-storage",
    },
  ),
)

export default useBoardStore

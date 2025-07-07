"use client"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useApp } from "../context/AppContext"
import useBoardStore from "../store/boardStore"
import BoardCreationModal from "./BoardCreationModal"
import {
  Home,
  Settings,
  User,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Star,
  Users,
  Activity,
  TrendingUp,
  Calendar,
} from "lucide-react"

const Sidebar = () => {
  const { getUserBoards, getCurrentBoard, setCurrentBoard, deleteBoard, canEditBoard } = useBoardStore()
  const { sidebarCollapsed, toggleSidebar } = useApp()
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [showBoardOptions, setShowBoardOptions] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const boards = getUserBoards()
  const currentBoard = getCurrentBoard()

  const navigationItems = [
    {
      label: "Home",
      path: "/dashboard",
      description: "Overview & stats",
      color: "text-blue-500",
    },
    {
      label: "Boards",
      path: "/dashboard/boards",
      description: "All your boards",
      color: "text-purple-500",
    },
  ]

  const userItems = [
    {
      icon: Settings,
      label: "Settings",
      path: "/dashboard/settings",
      description: "Preferences",
      color: "text-gray-500",
    },
    {
      icon: User,
      label: "Profile",
      path: "/dashboard/profile",
      description: "Your account",
      color: "text-green-500",
    },
  ]

  const handleBoardClick = (board) => {
    setCurrentBoard(board.id)
    navigate(`/dashboard/board/${board.id}`)
  }

  const handleBoardOptions = (e, board) => {
    e.preventDefault()
    e.stopPropagation()
    setShowBoardOptions(showBoardOptions === board.id ? null : board.id)
  }

  const handleDeleteBoard = (boardId) => {
    if (window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      deleteBoard(boardId)
      setShowBoardOptions(null)
      if (currentBoard?.id === boardId) {
        navigate("/dashboard/boards")
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("trello-auth")
    localStorage.removeItem("trello-user")
    localStorage.removeItem("access_token")
    navigate("/signin")
  }

  const recentBoards = boards.slice(0, 5)
  const starredBoards = boards.filter((board) => board.starred).slice(0, 3)

  // Calculate stats
  const totalCards = boards.reduce(
    (total, board) => total + board.lists.reduce((listTotal, list) => listTotal + list.cards.length, 0),
    0,
  )

  return (
    <>
      <div
        className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-slate-700/50 transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? "w-16" : "w-72"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <div className="w-4 h-4 bg-white rounded" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-slate-100">Trello Clone</span>
                <p className="text-xs text-gray-500 dark:text-slate-400">Project Management</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-ring"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        {/* Quick Stats */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200 dark:border-slate-700/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Boards</span>
                </div>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{boards.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Cards</span>
                </div>
                <p className="text-lg font-bold text-green-800 dark:text-green-200">{totalCards}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="p-4 space-y-2">
          {!sidebarCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Navigation
            </h3>
          )}
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                {item.label === "Home" ? (
                  <Home className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : item.color}`} />
                ) : (
                  <div
                    className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : item.color} rounded bg-current`}
                  />
                )}
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{item.description}</p>
                  </div>
                )}
                {isActive && !sidebarCollapsed && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </Link>
            )
          })}
        </div>

        {/* Starred Boards */}
        {!sidebarCollapsed && starredBoards.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700/50">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-500" />
              Starred
            </h3>
            <div className="space-y-1">
              {starredBoards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => handleBoardClick(board)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className={`w-3 h-3 rounded-full ${board.color}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{board.title}</span>
                  <Star className="w-3 h-3 text-yellow-500 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Boards Section */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Recent Boards
              </h3>
            )}
            <button
              onClick={() => setShowCreateBoard(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-ring group"
              title="Create Board"
            >
              <Plus className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-full custom-scrollbar">
            {recentBoards.map((board) => {
              const isCurrentBoard = currentBoard?.id === board.id
              const cardCount = board.lists.reduce((total, list) => total + list.cards.length, 0)

              return (
                <div key={board.id} className="relative">
                  <button
                    onClick={() => handleBoardClick(board)}
                    className={`group w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 interactive ${
                      isCurrentBoard
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-3 h-3 rounded-full ${board.color} flex-shrink-0 shadow-sm`} />
                      {!sidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{board.icon}</span>
                            <span
                              className={`text-sm font-medium truncate transition-colors ${
                                isCurrentBoard
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              }`}
                            >
                              {board.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {cardCount} cards
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {board.members?.length || 0}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    {!sidebarCollapsed && canEditBoard(board.id) && (
                      <button
                        onClick={(e) => handleBoardOptions(e, board)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-all focus-ring"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                      </button>
                    )}
                  </button>

                  {showBoardOptions === board.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowBoardOptions(null)} />
                      <div className="absolute right-0 top-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-2 z-20 min-w-[140px] fade-in">
                        <button
                          onClick={() => {
                            setShowBoardOptions(null)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Edit Board
                        </button>
                        <button
                          onClick={() => handleDeleteBoard(board.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          Delete Board
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}

            {boards.length === 0 && !sidebarCollapsed && (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-gray-400 dark:bg-slate-400 rounded opacity-50" />
                </div>
                <p className="text-sm font-medium mb-2">No boards yet</p>
                <button
                  onClick={() => setShowCreateBoard(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Create your first board
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700/50 space-y-2">
          {!sidebarCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-3 h-3" />
              Account
            </h3>
          )}
          {userItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : item.color}`} />
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{item.description}</p>
                  </div>
                )}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group focus-ring"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && (
              <div className="flex-1">
                <span className="font-medium">Logout</span>
                <p className="text-xs text-gray-500 dark:text-slate-400">Sign out</p>
              </div>
            )}
          </button>
        </div>
      </div>

      {showCreateBoard && <BoardCreationModal onClose={() => setShowCreateBoard(false)} />}
    </>
  )
}

export default Sidebar

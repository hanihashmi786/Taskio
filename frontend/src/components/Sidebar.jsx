"use client"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useApp } from "../context/AppContext"
import useBoardStore from "../store/boardStore"
import BoardCreationModal from "./BoardCreationModal"
import { Home, Trello, Settings, User, LogOut, Plus, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

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
    { icon: Trello, label: "Boards", path: "/dashboard/boards" },
  ]

  const userItems = [
    { icon: User, label: "Profile", path: "/dashboard/profile" },
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
      // If we're currently viewing the deleted board, navigate to boards page
      if (currentBoard?.id === boardId) {
        navigate("/dashboard/boards")
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("trello-auth");
    sessionStorage.removeItem("trello-auth");
    localStorage.removeItem("trello-user")
    localStorage.removeItem("access_token")
    navigate("/signin")
  }

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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Trello className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-slate-100">Task Pro</span>
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

        {/* Main Navigation */}
        <div className="p-4 space-y-2">
          {!sidebarCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Navigation
            </h3>
          )}
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        {/* Boards Section */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Boards
              </h3>
            )}
            <button
              onClick={() => setShowCreateBoard(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-ring group"
              title="Create Board"
            >
              <Plus className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-100" />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-full">
            {boards.map((board) => {
              const isCurrentBoard = currentBoard?.id === board.id
              return (
                <div key={board.id} className="relative">
                  <button
                    onClick={() => handleBoardClick(board)}
                    className={`group w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 interactive ${
                      isCurrentBoard
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                        : "hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-3 h-3 rounded-full ${board.color} flex-shrink-0`} />
                      {!sidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
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
                            // Handle edit board
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
                <Trello className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No boards yet</p>
                <button
                  onClick={() => setShowCreateBoard(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
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
            <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">
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
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group focus-ring"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {showCreateBoard && <BoardCreationModal onClose={() => setShowCreateBoard(false)} />}
    </>
  )
}

export default Sidebar

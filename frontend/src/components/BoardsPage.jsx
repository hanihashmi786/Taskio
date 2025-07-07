"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useBoardStore from "../store/boardStore"
import BoardCreationModal from "./BoardCreationModal"
import { Plus, Calendar, Users, Star, MoreHorizontal, Trash2, Edit3, Search, Grid, List } from "lucide-react"

const BoardsPage = () => {
  const { getUserBoards, setCurrentBoard, deleteBoard, canEditBoard } = useBoardStore()
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [showBoardOptions, setShowBoardOptions] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all") // all, starred, recent
  const [viewMode, setViewMode] = useState("grid") // grid, list
  const navigate = useNavigate()

  const boards = getUserBoards()

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
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getCardCount = (board) => {
    return board.lists.reduce((total, list) => total + list.cards.length, 0)
  }

  // Filter and search boards
  const filteredBoards = boards.filter((board) => {
    const matchesSearch =
      board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    switch (filterBy) {
      case "starred":
        return board.starred
      case "recent":
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(board.updatedAt || board.createdAt) > weekAgo
      default:
        return true
    }
  })

  const starredBoards = boards.filter((board) => board.starred)

  return (
    <>
      <div className="p-6 overflow-y-auto h-full bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Your Boards</h1>
                <p className="text-gray-600 dark:text-slate-400">
                  Manage and organize your projects with Kanban boards
                </p>
              </div>
              <button
                onClick={() => setShowCreateBoard(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Board
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search boards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Boards</option>
                  <option value="starred">Starred</option>
                  <option value="recent">Recent</option>
                </select>

                <div className="flex border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 card-shadow border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Total Boards</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{boards.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 card-shadow border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Total Cards</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
                      {boards.reduce((total, board) => total + getCardCount(board), 0)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 card-shadow border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Starred</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{starredBoards.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 card-shadow border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Team Members</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
                      {boards.reduce((total, board) => {
                        const uniqueMembers = new Set()
                        board.members?.forEach((member) => uniqueMembers.add(member.id))
                        return total + uniqueMembers.size
                      }, 0)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boards Grid/List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {filterBy === "all" ? "All Boards" : filterBy === "starred" ? "Starred Boards" : "Recent Boards"}
                <span className="text-gray-500 dark:text-slate-400 ml-2">({filteredBoards.length})</span>
              </h2>
            </div>

            {filteredBoards.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {searchTerm ? (
                    <Search className="w-8 h-8 text-gray-400 dark:text-slate-400" />
                  ) : (
                    <Plus className="w-8 h-8 text-gray-400 dark:text-slate-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  {searchTerm ? "No boards found" : "No boards yet"}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first board to get started"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateBoard(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Board
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-4"
                }
              >
                {filteredBoards.map((board) => (
                  <div key={board.id} className="relative group">
                    <button
                      onClick={() => handleBoardClick(board)}
                      className={`w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-lg transition-all duration-200 card-shadow text-left interactive ${
                        viewMode === "list" ? "p-4 flex items-center gap-4" : "p-6"
                      }`}
                    >
                      <div className={`flex items-center ${viewMode === "list" ? "gap-4 flex-1" : "space-x-3 mb-4"}`}>
                        <div className={`w-4 h-4 rounded-full ${board.color}`} />
                        <span className="text-2xl">{board.icon}</span>
                        {board.starred && <Star className="w-4 h-4 text-yellow-500" />}
                        {viewMode === "list" && (
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {board.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-slate-400 truncate">
                              {board.description || "No description"}
                            </p>
                          </div>
                        )}
                      </div>

                      {viewMode === "grid" && (
                        <>
                          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {board.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
                            {board.description || "No description"}
                          </p>
                        </>
                      )}

                      <div
                        className={`flex items-center text-xs text-gray-500 dark:text-slate-400 ${viewMode === "list" ? "gap-6" : "justify-between mb-2"}`}
                      >
                        <span>{board.lists.length} lists</span>
                        <span>{getCardCount(board)} cards</span>
                        <span>{board.members?.length || 0} members</span>
                      </div>

                      {viewMode === "grid" && (
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          Created {formatDate(board.createdAt)}
                        </div>
                      )}
                    </button>

                    {canEditBoard(board.id) && (
                      <button
                        onClick={(e) => handleBoardOptions(e, board)}
                        className={`absolute opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all focus-ring ${
                          viewMode === "list" ? "right-4 top-1/2 transform -translate-y-1/2" : "top-4 right-4"
                        }`}
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                      </button>
                    )}

                    {showBoardOptions === board.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowBoardOptions(null)} />
                        <div className="absolute right-4 top-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-2 z-20 min-w-[140px] fade-in">
                          <button
                            onClick={() => {
                              setShowBoardOptions(null)
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Board
                          </button>
                          <button
                            onClick={() => handleDeleteBoard(board.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Board
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Create New Board Card */}
                <button
                  onClick={() => setShowCreateBoard(true)}
                  className={`bg-white dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl transition-colors flex items-center justify-center group focus-ring ${
                    viewMode === "list" ? "p-4 h-20" : "p-6 flex-col min-h-[200px]"
                  }`}
                >
                  <Plus className="w-8 h-8 text-gray-400 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-3" />
                  <span className="text-sm font-medium text-gray-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Create new board
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateBoard && <BoardCreationModal onClose={() => setShowCreateBoard(false)} />}
    </>
  )
}

export default BoardsPage

"use client"
import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import useBoardStore from "../store/boardStore"
import { Plus, Clock, Users, Star, TrendingUp, Calendar, Activity, CheckCircle, ArrowRight, Zap } from "lucide-react"

const DashboardHome = () => {
  const { showModal, setCurrentBoard } = useApp()
  const { getUserBoards } = useBoardStore()

  const boards = getUserBoards()

  const handleCreateBoard = () => {
    showModal("createBoard")
  }

  const handleBoardClick = (board) => {
    setCurrentBoard(board.id)
  }

  const recentBoards = boards.slice(0, 4)
  const starredBoards = boards.filter((board) => board.starred).slice(0, 4)

  // Calculate comprehensive stats
  const totalCards = boards.reduce(
    (total, board) => total + board.lists.reduce((listTotal, list) => listTotal + list.cards.length, 0),
    0,
  )

  const completedCards = boards.reduce((total, board) => {
    const doneList = board.lists.find(
      (list) => list.title.toLowerCase().includes("done") || list.title.toLowerCase().includes("completed"),
    )
    return total + (doneList ? doneList.cards.length : 0)
  }, 0)

  const overdueCards = boards.reduce((total, board) => {
    return (
      total +
      board.lists.reduce((listTotal, list) => {
        return listTotal + list.cards.filter((card) => card.dueDate && new Date(card.dueDate) < new Date()).length
      }, 0)
    )
  }, 0)

  const totalMembers = boards.reduce((total, board) => {
    const uniqueMembers = new Set()
    board.members?.forEach((member) => uniqueMembers.add(member.id))
    return total + uniqueMembers.size
  }, 0)

  return (
    <div className="p-6 overflow-y-auto h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back!
              </h1>
              <p className="text-gray-600 dark:text-slate-400 text-lg">Here's your productivity overview for today</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-slate-400">Today</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-medium mb-1">Active Boards</p>
                <p className="text-3xl font-bold">{boards.length}</p>
                <p className="text-blue-200 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Your projects
                </p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 bg-white rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 font-medium mb-1">Total Tasks</p>
                <p className="text-3xl font-bold">{totalCards}</p>
                <p className="text-green-200 text-sm mt-2 flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  In progress
                </p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold">{completedCards}</p>
                <p className="text-purple-200 text-sm mt-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Tasks done
                </p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 font-medium mb-1">Team Size</p>
                <p className="text-3xl font-bold">{totalMembers || 1}</p>
                <p className="text-orange-200 text-sm mt-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Collaborators
                </p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </h2>
                <Link
                  to="/dashboard/boards"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentBoards.slice(0, 5).map((board, index) => (
                  <div
                    key={board.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${board.color} shadow-sm`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{board.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-400 dark:bg-slate-500 rounded" />
                          {board.lists.reduce((total, list) => total + list.cards.length, 0)} cards
                        </span>
                        <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {board.lists.length} lists
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        {new Date(board.updatedAt || board.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}

                {recentBoards.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400 dark:text-slate-400" />
                    </div>
                    <p className="text-gray-500 dark:text-slate-400 font-medium">No recent activity</p>
                    <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">
                      Create your first board to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </h2>

              <div className="space-y-4">
                <button
                  onClick={handleCreateBoard}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create New Board</span>
                </button>

                <Link
                  to="/dashboard/boards"
                  className="w-full bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-3"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Browse All Boards</span>
                </Link>

                {overdueCards > 0 && (
                  <div className="w-full bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-300">Overdue Tasks</p>
                        <p className="text-sm text-red-600 dark:text-red-400">{overdueCards} cards need attention</p>
                      </div>
                    </div>
                  </div>
                )}

                {boards.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Productivity Score</p>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {Math.round((completedCards / Math.max(totalCards, 1)) * 100)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-slate-400">% Complete</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Boards */}
        {recentBoards.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Recent Boards</h2>
              <Link
                to="/dashboard/boards"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentBoards.map((board) => (
                <Link
                  key={board.id}
                  to={`/dashboard/board/${board.id}`}
                  onClick={() => handleBoardClick(board)}
                  className="group"
                >
                  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-4 h-4 rounded-full ${board.color} shadow-sm`} />
                      <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {board.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {board.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>{board.lists.length} lists</span>
                      <span>{board.lists.reduce((total, list) => total + list.cards.length, 0)} cards</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Create New Board Card */}
              <button
                onClick={handleCreateBoard}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] group transform hover:-translate-y-1"
              >
                <Plus className="w-8 h-8 text-gray-400 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-3" />
                <span className="text-sm font-medium text-gray-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Create new board
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Starred Boards */}
        {starredBoards.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Starred Boards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {starredBoards.map((board) => (
                <Link
                  key={board.id}
                  to={`/dashboard/board/${board.id}`}
                  onClick={() => handleBoardClick(board)}
                  className="group"
                >
                  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-4 h-4 rounded-full ${board.color} shadow-sm`} />
                      <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full" />
                      <Star className="w-4 h-4 text-yellow-500 ml-auto" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {board.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {board.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>{board.lists.length} lists</span>
                      <span>{board.lists.reduce((total, list) => total + list.cards.length, 0)} cards</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardHome

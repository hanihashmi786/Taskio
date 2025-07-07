"use client"
import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { Plus, Clock, Users, Star } from "lucide-react"

const DashboardHome = () => {
  const { boards, showModal, setCurrentBoard } = useApp()

  const handleCreateBoard = () => {
    showModal("createBoard")
  }

  const handleBoardClick = (board) => {
    setCurrentBoard(board)
  }

  const recentBoards = boards.slice(0, 4)
  const starredBoards = boards.filter((board) => board.starred).slice(0, 4)

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Boards</p>
                <p className="text-2xl font-bold">{boards.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Cards</p>
                <p className="text-2xl font-bold">
                  {boards.reduce(
                    (total, board) => total + board.lists.reduce((listTotal, list) => listTotal + list.cards.length, 0),
                    0,
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {boards.reduce((total, board) => {
                    const doneList = board.lists.find(
                      (list) =>
                        list.title.toLowerCase().includes("done") || list.title.toLowerCase().includes("completed"),
                    )
                    return total + (doneList ? doneList.cards.length : 0)
                  }, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Boards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Boards</h2>
            <Link to="/boards" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentBoards.map((board) => (
              <Link
                key={board.id}
                to={`/dashboard/board/${board.id}`}
                onClick={() => handleBoardClick(board)}
                className="group"
              >
                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 card-hover">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-4 h-4 rounded ${board.color}`} />
                    <span className="text-lg">{board.icon}</span>
                  </div>
                  <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">{board.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{board.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{board.lists.length} lists</span>
                    <span>{board.lists.reduce((total, list) => total + list.cards.length, 0)} cards</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Create New Board Card */}
            <button
              onClick={handleCreateBoard}
              className="bg-card border border-dashed border-border rounded-lg p-4 hover:bg-accent transition-colors flex flex-col items-center justify-center min-h-[140px] group btn-animate"
            >
              <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Create new board
              </span>
            </button>
          </div>
        </div>

        {/* Starred Boards */}
        {starredBoards.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Starred Boards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {starredBoards.map((board) => (
                <Link
                  key={board.id}
                  to={`/dashboard/board/${board.id}`}
                  onClick={() => handleBoardClick(board)}
                  className="group"
                >
                  <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 card-hover">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-4 h-4 rounded ${board.color}`} />
                      <span className="text-lg">{board.icon}</span>
                      <Star className="w-4 h-4 text-yellow-500 ml-auto" />
                    </div>
                    <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">{board.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{board.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
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

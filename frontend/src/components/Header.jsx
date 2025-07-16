"use client"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { useTheme } from "../context/ThemeContext"
import useBoardStore from "../store/boardStore"
import BoardMembers from "./BoardMembers"
import { Sun, Moon, Search, Menu, User, LogOut, Users } from "lucide-react"

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "";

function getAvatarUrl(avatar) {
  if (!avatar) return "/placeholder.svg";
  if (avatar.startsWith("http")) return avatar;
  if (avatar.startsWith("/media/")) return MEDIA_URL.replace(/\/$/, "") + avatar;
  if (avatar.startsWith("media/")) return MEDIA_URL.replace(/\/$/, "") + "/" + avatar;
  if (avatar.startsWith("avatars/")) return MEDIA_URL.replace(/\/$/, "") + "/media/" + avatar;
  return avatar;
}

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user: contextUser, sidebarCollapsed, toggleSidebar } = useApp()
  const { getCurrentBoard } = useBoardStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showBoardMembers, setShowBoardMembers] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const currentBoard = getCurrentBoard()
  const isDashboardHome = location.pathname === "/dashboard"
  const isBoardView = location.pathname.includes("/dashboard/board/")

  // --- Always get the freshest user info (context + localStorage fallback) ---
  let storedAuth = localStorage.getItem("trello-auth");
  if (!storedAuth) {
    storedAuth = sessionStorage.getItem("trello-auth");
  }
  let user = contextUser || {};
  if (storedAuth) {
    try {
      const parsed = JSON.parse(storedAuth).user;
      if (parsed) {
        user = { ...user, ...parsed };
      }
    } catch (e) {}
  }

  // Clean up first/last name
  const displayName =
    (user.first_name || user.last_name
      ? `${(user.first_name || "").trim()} ${(user.last_name || "").trim()}`.trim()
      : user.name || user.username || "User") || "User"

  const displayEmail = user.email || "No email"

  // Debug: log the avatar value
  console.log("Header contextUser:", contextUser);
  console.log("Header user:", user);
  console.log("Header avatar:", user.avatar);

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("trello-auth");
    sessionStorage.removeItem("trello-auth");
    localStorage.removeItem("trello-user")
    localStorage.removeItem("access_token")
    navigate("/signin")
  }

  const getPageTitle = () => {
    if (isDashboardHome) return "Dashboard"
    if (location.pathname === "/dashboard/boards") return "All Boards"
    if (location.pathname === "/dashboard/profile") return "Profile"
    if (location.pathname === "/dashboard/settings") return "Settings"
    if (isBoardView && currentBoard) return currentBoard.title
    return "Trello Clone"
  }

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700/50 px-6 py-4 transition-colors duration-200">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors lg:hidden focus-ring"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              </button>
            )}

            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boards, cards..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-80 text-sm placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-all duration-200 text-gray-900 dark:text-slate-100"
              />
            </form>
          </div>

          {/* Center Section - Page Title */}
          <div className="flex items-center space-x-3">
            {isBoardView && currentBoard && (
              <>
                <div className={`w-3 h-3 rounded-full ${currentBoard.color || "bg-blue-500"}`} />
                <button
                  onClick={() => setShowBoardMembers(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm"
                  title="Board Members"
                >
                  <Users className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  <span className="text-gray-700 dark:text-slate-300">{currentBoard.members?.length || 0}</span>
                </button>
              </>
            )}
            <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{getPageTitle()}</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 ml-2 pl-2 border-l border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg p-2 transition-colors"
              >
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={displayName}
                  className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-slate-600"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {displayEmail}
                  </p>
                </div>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-2 z-20 min-w-[180px] fade-in">
                    <button
                      onClick={() => {
                        navigate("/dashboard/profile")
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <hr className="my-2 border-gray-200 dark:border-slate-600" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Board Members Modal */}
      {showBoardMembers && currentBoard && (
        <BoardMembers boardId={currentBoard.id} onClose={() => setShowBoardMembers(false)} />
      )}
    </>
  )
}

export default Header

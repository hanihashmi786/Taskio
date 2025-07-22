"use client"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { useTheme } from "../context/ThemeContext"
import useBoardStore from "../store/boardStore"
import BoardMembers from "./BoardMembers"
import NotificationCenter from "./NotificationCenter"
import { Sun, Moon, Search, Menu, User, LogOut, Users, Bell, Settings, Loader2 } from "lucide-react"
import API from "../api"
import { fetchNotifications, markNotificationsAsRead as markReadAPI, deleteNotification } from "../api/notifications"

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || ""

function getAvatarUrl(avatar) {
  if (!avatar) return "/placeholder.svg?height=32&width=32"
  if (avatar.startsWith("http")) return avatar
  if (avatar.startsWith("/media/")) return MEDIA_URL.replace(/\/$/, "") + avatar
  if (avatar.startsWith("media/")) return MEDIA_URL.replace(/\/$/, "") + "/" + avatar
  if (avatar.startsWith("avatars/")) return MEDIA_URL.replace(/\/$/, "") + "/media/" + avatar
  return avatar
}

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user: contextUser, sidebarCollapsed, toggleSidebar, setUser } = useApp()
  const { getCurrentBoard, fetchBoards, isLoading: boardsLoading } = useBoardStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showBoardMembers, setShowBoardMembers] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const currentBoard = getCurrentBoard()
  const isDashboardHome = location.pathname === "/dashboard"
  const isBoardView = location.pathname.includes("/dashboard/board/")
  const isAuthenticated = !!contextUser?.id

  // Fetch user data on component mount if authenticated but no user data
  useEffect(() => {
    const fetchUserData = async () => {
      // Check for auth token
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token")

      if (token && (!contextUser || !contextUser.id)) {
        setIsLoading(true)
        try {
          const response = await API.get("/accounts/me/")
          setUser(response.data)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
          // Handle token expiration
          if (error.response && error.response.status === 401) {
            handleLogout()
          }
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserData()
  }, [contextUser, setUser])

  // Fetch notifications from backend
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
        .then(res => {
          setNotifications(res.data)
          setUnreadCount(res.data.filter(n => !n.read).length)
        })
        .catch(err => {
          console.error("Failed to fetch notifications:", err)
        })
    }
  }, [isAuthenticated])

  // --- Always get the freshest user info (context + localStorage fallback) ---
  let storedAuth = localStorage.getItem("trello-auth")
  if (!storedAuth) {
    storedAuth = sessionStorage.getItem("trello-auth")
  }

  let user = contextUser || {}
  if (storedAuth) {
    try {
      const parsed = JSON.parse(storedAuth).user
      if (parsed) {
        user = { ...user, ...parsed }
      }
    } catch (e) {
      console.error("Error parsing stored auth:", e)
    }
  }

  // Clean up first/last name
  const displayName =
    (user.first_name || user.last_name
      ? `${(user.first_name || "").trim()} ${(user.last_name || "").trim()}`.trim()
      : user.name || user.username || "User") || "User"

  const displayEmail = user.email || "No email"

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsLoading(true)
      try {
        // Implement search API call
        const response = await API.get(`/search/?q=${encodeURIComponent(searchQuery)}`)
        // Handle search results - navigate to search results page or show dropdown
        navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleLogout = () => {
    // Call logout API endpoint
    API.post("/accounts/logout/")
      .catch((error) => console.error("Logout error:", error))
      .finally(() => {
        // Clear all auth data regardless of API response
        localStorage.removeItem("trello-auth")
        sessionStorage.removeItem("trello-auth")
        localStorage.removeItem("trello-user")
        localStorage.removeItem("access_token")
        sessionStorage.removeItem("access_token")
        setUser(null)
        navigate("/signin")
      })
  }

  const markNotificationsAsRead = async () => {
    if (unreadCount === 0) return
    try {
      await markReadAPI()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  const handleRemoveNotification = async (id) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const getPageTitle = () => {
    if (isDashboardHome) return "Dashboard"
    if (location.pathname === "/dashboard/boards") return "All Boards"
    if (location.pathname === "/dashboard/profile") return "Profile"
    if (isBoardView && currentBoard) return currentBoard.title
    return "Task Pro"
  }

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700/50 px-4 md:px-6 py-3 transition-colors duration-200 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              </button>
            )}

            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-32 sm:w-48 md:w-64 lg:w-80 text-sm placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-all duration-200 text-gray-900 dark:text-slate-100"
                aria-label="Search boards and cards"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </form>
          </div>

          {/* Center Section - Page Title */}
          <div className="flex items-center space-x-3">
            {isBoardView && currentBoard && (
              <>
                <div className={`w-3 h-3 rounded-full ${currentBoard.color || "bg-blue-500"}`} />
                <button
                  onClick={() => setShowBoardMembers(true)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm"
                  title="Board Members"
                >
                  <Users className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  <span className="text-gray-700 dark:text-slate-300">{currentBoard?.members?.length || 0}</span>
                </button>
              </>
            )}
            <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-slate-100 truncate max-w-[150px] md:max-w-xs">
              {getPageTitle()}
            </h1>
            {boardsLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 md:space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    if (!showNotifications && unreadCount > 0) {
                      markNotificationsAsRead()
                    }
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationCenter
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkAsRead={markNotificationsAsRead}
                    onRemove={handleRemoveNotification}
                  />
                )}
              </div>
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 ml-1 pl-1 md:ml-2 md:pl-2 border-l border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg p-1.5 md:p-2 transition-colors"
                  aria-label="User menu"
                >
                  <img
                    src={getAvatarUrl(user.avatar) || "/placeholder.svg"}
                    alt={displayName}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full ring-2 ring-gray-200 dark:ring-slate-600 object-cover"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate max-w-[120px]">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[120px]">{displayEmail}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-2 z-20 min-w-[200px] animate-in fade-in-0 zoom-in-95">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-600 mb-1">
                        <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{displayEmail}</p>
                      </div>

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

                     

                      <hr className="my-1 border-gray-200 dark:border-slate-600" />

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
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate("/signin")}
                  className="px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
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

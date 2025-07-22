"use client"
import { useState } from "react"
import { X, Bell, Check, Clock, Users, MessageCircle, Calendar, ArrowRight, Trash2 } from "lucide-react"

const NotificationCenter = ({ notifications, onClose, onMarkAsRead, onRemove, onNotificationClick }) => {
  const [filter, setFilter] = useState("all") // all, unread, mentions, assignments

  const getNotificationIcon = (type) => {
    switch (type) {
      case "member_joined":
        return <Users className="w-5 h-5 text-green-500" />
      case "card_assigned":
        return <Users className="w-5 h-5 text-blue-500" />
      case "mention":
        return <MessageCircle className="w-5 h-5 text-purple-500" />
      case "due_date_near":
        return <Calendar className="w-5 h-5 text-orange-500" />
      case "card_moved":
        return <ArrowRight className="w-5 h-5 text-indigo-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type, read) => {
    if (read) return "bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"

    switch (type) {
      case "member_joined":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "card_assigned":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      case "mention":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
      case "due_date_near":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
      case "card_moved":
        return "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
      default:
        return "bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.read
      case "mentions":
        return notification.type === "mention"
      case "assignments":
        return notification.type === "card_assigned"
      default:
        return true
    }
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl z-20 w-96 max-h-[600px] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-slate-100">Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAsRead}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Mark all as read"
              >
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50">
          {[
            { id: "all", label: "All", count: notifications.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "mentions", label: "Mentions", count: notifications.filter((n) => n.type === "mention").length },
            {
              id: "assignments",
              label: "Assigned",
              count: notifications.filter((n) => n.type === "card_assigned").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors relative ${
                filter === tab.id
                  ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
              {filter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-1">No notifications</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {filter === "all" ? "You're all caught up!" : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredNotifications.map((notification) => {
                const handleClick = () => {
                  if (onNotificationClick && notification.card_id && notification.board_id) {
                    onNotificationClick(notification.card_id, notification.board_id)
                  }
                }
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-l-4 ${getNotificationColor(notification.type, notification.read)}`}
                    onClick={handleClick}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-relaxed ${notification.read ? "text-gray-600 dark:text-slate-400" : "text-gray-900 dark:text-slate-100 font-medium"}`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                            <button
                              onClick={() => onRemove && onRemove(notification.id)}
                              className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Remove notification"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        {/* Additional context based on notification type */}
                        {notification.board_name && (
                          <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-slate-600 rounded text-xs text-gray-600 dark:text-slate-300">
                            Board: {notification.board_name}
                          </div>
                        )}
                        {notification.card_title && (
                          <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-slate-600 rounded text-xs text-gray-600 dark:text-slate-300">
                            Card: {notification.card_title}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>{filteredNotifications.length} notifications</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default NotificationCenter

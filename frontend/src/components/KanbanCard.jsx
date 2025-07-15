"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, CheckSquare, MessageCircle, Clock, Users } from "lucide-react"
import { getLabelById } from "../utils/labels"
import useBoardStore from "../store/boardStore"

const KanbanCard = ({ card, onClick, isDragging = false }) => {
  const { getCurrentBoard } = useBoardStore()
  const board = getCurrentBoard()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Properly extract label IDs (if any)
  const labelIds = Array.isArray(card.labels)
    ? card.labels.map((l) => (typeof l === "number" ? l : Number.parseInt(l)))
    : []

  const isOverdue = card.due_date && new Date(card.due_date) < new Date()
  const completedTasks = Array.isArray(card.checklist) ? card.checklist.filter((item) => item.completed).length : 0
  const totalTasks = Array.isArray(card.checklist) ? card.checklist.length : 0

  // Find assigned members (if board data is loaded)
  const assignedMembers =
    Array.isArray(board?.members) && Array.isArray(card.assignees)
      ? board.members.filter((member) => card.assignees.includes(member.id))
      : []

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-lg card-shadow border border-gray-200 dark:border-slate-700/50 p-4 cursor-pointer
        hover:card-shadow-hover hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-200 interactive
        ${isSortableDragging || isDragging ? "dragging" : ""}
        ${isDragging ? "card-shadow-hover" : ""}
      `}
    >
      {/* Labels */}
      {labelIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {labelIds.map((labelId) => {
            const labelData = getLabelById(labelId)
            if (!labelData) return null
            return (
              <span
                key={labelData.id}
                className={`${labelData.color} ${labelData.textColor} text-xs px-2 py-0.5 rounded-full font-medium`}
              >
                {labelData.name}
              </span>
            )
          })}
        </div>
      )}

      {/* Title */}
      <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 leading-snug text-sm">{card.title}</h4>

      {/* Description Preview */}
      {card.description && (
        <p className="text-xs text-gray-600 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Assigned Members */}
      {assignedMembers.length > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <Users className="w-3 h-3 text-gray-500 dark:text-slate-400" />
          <div className="flex -space-x-1">
            {assignedMembers.slice(0, 3).map((member) => (
              <img
                key={member.id}
                src={member.avatar || "/placeholder.svg"}
                alt={`${member.first_name} ${member.last_name}`}
                className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-700 hover:z-10 transition-transform hover:scale-110"
                title={`${member.first_name} ${member.last_name}`}
              />
            ))}
            {assignedMembers.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-slate-600 ring-2 ring-white dark:ring-slate-700 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-slate-300">
                  +{assignedMembers.length - 3}
                </span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-600 dark:text-slate-400 ml-1">
            {assignedMembers.length === 1
              ? `${assignedMembers[0].first_name} ${assignedMembers[0].last_name}`
              : `${assignedMembers.length} members`}
          </span>
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          {card.due_date && (
            <div
              className={`flex items-center gap-1 ${isOverdue ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-slate-400"}`}
            >
              {isOverdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              <span className="font-medium">
                {new Date(card.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Checklist Progress */}
          {totalTasks > 0 && (
            <div
              className={`flex items-center gap-1 ${completedTasks === totalTasks ? "text-green-500 dark:text-green-400" : "text-gray-500 dark:text-slate-400"}`}
            >
              <CheckSquare className="w-3 h-3" />
              <span className="font-medium">
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}

          {/* Comments */}
          {card.comments && card.comments.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
              <MessageCircle className="w-3 h-3" />
              <span className="font-medium">{card.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KanbanCard

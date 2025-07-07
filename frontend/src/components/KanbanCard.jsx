"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, CheckSquare, MessageCircle, Clock } from "lucide-react"
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
    data: {
      type: "card",
      card,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()
  const completedTasks = card.checklist?.filter((item) => item.completed).length || 0
  const totalTasks = card.checklist?.length || 0

  // Find assigned member
  const assignedMember = board?.members.find((member) => member.id === card.assignedTo)

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
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.labels.map((label) => {
            const labelData = typeof label === "string" ? getLabelById(label) : label
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

      {/* Assigned Member */}
      {assignedMember && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <img
            src={assignedMember.avatar || "/placeholder.svg"}
            alt={assignedMember.name}
            className="w-6 h-6 rounded-full ring-2 ring-gray-200 dark:ring-slate-600"
          />
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{assignedMember.name}</span>
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          {card.dueDate && (
            <div
              className={`flex items-center gap-1 ${isOverdue ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-slate-400"}`}
            >
              {isOverdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              <span className="font-medium">
                {new Date(card.dueDate).toLocaleDateString("en-US", {
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

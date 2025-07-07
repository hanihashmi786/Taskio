"use client"
import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal, Plus, Trash2, GripVertical } from "lucide-react"
import useBoardStore from "../store/boardStore"
import KanbanCard from "./KanbanCard"
import AddCardForm from "./AddCardForm"

const KanbanList = ({ list, boardId, onCardClick, ...props }) => {
  const { updateList, deleteList, canAccessBoard } = useBoardStore()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [showAddCard, setShowAddCard] = useState(false)
  const [addCardIndex, setAddCardIndex] = useState(-1)
  const [showMenu, setShowMenu] = useState(false)

  const hasAccess = canAccessBoard(boardId)

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
    data: {
      type: "list",
      list,
    },
  })

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "list",
      list,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleTitleSubmit = () => {
    if (title.trim() && title !== list.title && hasAccess) {
      updateList(boardId, list.id, { title: title.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleSubmit()
    } else if (e.key === "Escape") {
      setTitle(list.title)
      setIsEditing(false)
    }
  }

  const handleDeleteList = () => {
    if (window.confirm("Are you sure you want to delete this list?") && hasAccess) {
      deleteList(boardId, list.id)
    }
    setShowMenu(false)
  }

  const handleAddCard = (index = -1) => {
    if (hasAccess) {
      setAddCardIndex(index)
      setShowAddCard(true)
    }
  }

  const handleAddCardComplete = () => {
    setShowAddCard(false)
    setAddCardIndex(-1)
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div
      ref={setSortableRef}
      style={style}
      data-list-id={list.id}
      {...props}
      className={`flex-shrink-0 w-72 ${isDragging ? "opacity-50 rotate-2 scale-105" : ""} transition-all duration-200`}
    >
      <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl card-shadow border border-gray-200 dark:border-slate-700/50 h-fit max-h-[calc(100vh-200px)] flex flex-col">
        {/* List Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <button
                {...attributes}
                {...listeners}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-grab active:cursor-grabbing transition-colors"
                title="Drag to reorder list"
              >
                <GripVertical className="w-4 h-4 text-gray-400 dark:text-slate-400" />
              </button>

              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyPress}
                  className="flex-1 text-base font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-slate-100 focus-ring rounded px-2 py-1 -mx-2 -my-1"
                  autoFocus
                />
              ) : (
                <h3
                  className="flex-1 text-base font-semibold text-gray-900 dark:text-slate-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {list.title}
                </h3>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-ring"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-400 dark:text-slate-400" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-2 z-20 min-w-[140px] fade-in">
                    <button
                      onClick={handleDeleteList}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete list
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
            <span className="font-medium">{list.cards.length} cards</span>
          </div>
        </div>

        {/* Cards Container */}
        <div
          ref={setDroppableRef}
          className="flex-1 p-3 space-y-3 min-h-[150px] max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar"
        >
          <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {list.cards.length === 0 && !showAddCard ? (
              <div className="text-center py-8 text-gray-400 dark:text-slate-400">
                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium mb-2">No cards yet</p>
                <button
                  onClick={() => handleAddCard()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Add your first card
                </button>
              </div>
            ) : (
              <>
                {/* Add card at top */}
                {showAddCard && addCardIndex === 0 && (
                  <div className="mb-3">
                    <AddCardForm
                      boardId={boardId}
                      listId={list.id}
                      insertIndex={0}
                      onCancel={handleAddCardComplete}
                      onAdd={handleAddCardComplete}
                    />
                  </div>
                )}

                {list.cards.map((card, index) => (
                  <div key={card.id}>
                    <KanbanCard card={card} onClick={() => onCardClick(card)} />

                    {/* Add card button between cards */}
                    <div className="flex justify-center py-2 opacity-0 hover:opacity-100 transition-opacity group">
                      <button
                        onClick={() => handleAddCard(index + 1)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200 transform hover:scale-110"
                        title="Add card here"
                      >
                        <Plus className="w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                      </button>
                    </div>

                    {/* Add card form at specific position */}
                    {showAddCard && addCardIndex === index + 1 && (
                      <div className="my-3">
                        <AddCardForm
                          boardId={boardId}
                          listId={list.id}
                          insertIndex={index + 1}
                          onCancel={handleAddCardComplete}
                          onAdd={handleAddCardComplete}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add card at end */}
                {showAddCard && addCardIndex === -1 && (
                  <div className="mt-3">
                    <AddCardForm
                      boardId={boardId}
                      listId={list.id}
                      insertIndex={-1}
                      onCancel={handleAddCardComplete}
                      onAdd={handleAddCardComplete}
                    />
                  </div>
                )}
              </>
            )}
          </SortableContext>
        </div>

        {/* Add Card at Bottom */}
        {!showAddCard && (
          <div className="p-3 border-t border-gray-200 dark:border-slate-700/30">
            <button
              onClick={() => handleAddCard()}
              className="w-full flex items-center gap-2 p-3 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 group focus-ring"
            >
              <Plus className="w-4 h-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium">Add a card</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanList

"use client"
import { useEffect, useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal, Plus, Trash2, GripVertical, Edit3, Check, X } from "lucide-react"
import useListStore from "../store/listStore"
import useCardStore from "../store/cardStore"
import KanbanCard from "./KanbanCard"
import AddCardForm from "./AddCardForm"
import CardModal from "./CardModal"

const KanbanList = ({ list, boardId, onCardClick, allLists, ...props }) => {
  const { updateList, deleteList } = useListStore()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [showAddCard, setShowAddCard] = useState(false)
  const [addCardIndex, setAddCardIndex] = useState(-1)
  const [showMenu, setShowMenu] = useState(false)

  const [selectedCard, setSelectedCard] = useState(null)
  const [showCardModal, setShowCardModal] = useState(false)

  const { cards, fetchCards, setCardsForList, updateCard } = useCardStore()
  const cardsForList = cards[list.id] || []

  useEffect(() => {
    fetchCards(list.id)
  }, [list.id, fetchCards])

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
    data: { type: "list", list },
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
    data: { type: "list", list },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleEditTitle = async () => {
    if (title.trim() && title !== list.title) {
      await updateList(list.id, { title: title.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleEditTitle()
    else if (e.key === "Escape") setIsEditing(false)
  }

  const handleDeleteList = async () => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      await deleteList(list.id)
      setShowMenu(false)
    }
  }

  const handleAddCard = (index = -1) => {
    setAddCardIndex(index)
    setShowAddCard(true)
  }

  const handleAddCardComplete = () => {
    setShowAddCard(false)
    setAddCardIndex(-1)
    fetchCards(list.id)
  }

  const handleCardClick = (card) => {
    setSelectedCard(card)
    setShowCardModal(true)
  }

  const handleCardModalClose = () => {
    setShowCardModal(false)
    setSelectedCard(null)
    fetchCards(list.id)
  }

  return (
    <>
      <div
        ref={setSortableRef}
        style={style}
        data-list-id={list.id}
        {...props}
        className={`flex-shrink-0 w-80 ${isDragging ? "opacity-60 rotate-2 scale-105" : ""} transition-all duration-200`}
      >
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 dark:border-slate-700/50 h-fit max-h-[calc(100vh-200px)] flex flex-col overflow-hidden">
          {/* List Header */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-700/30 bg-gradient-to-r from-white/60 to-transparent dark:from-slate-800/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <button
                  {...attributes}
                  {...listeners}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-grab active:cursor-grabbing transition-colors"
                  title="Drag to reorder list"
                >
                  <GripVertical className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                </button>

                {isEditing ? (
                  <div className="flex items-center flex-1 gap-3">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleEditTitle}
                      onKeyDown={handleKeyPress}
                      className="flex-1 text-lg font-bold bg-transparent border-none outline-none text-gray-900 dark:text-slate-100 focus-ring rounded-xl px-3 py-2 -mx-3 -my-2"
                      autoFocus
                    />
                    <button onClick={handleEditTitle} className="p-1.5 hover:bg-green-100 rounded-lg">
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center flex-1 group">
                    <h3
                      className="flex-1 text-lg font-bold text-gray-900 dark:text-slate-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl px-3 py-2 -mx-3 -my-2 transition-colors"
                      onClick={() => setIsEditing(true)}
                      title="Click to rename list"
                    >
                      {list.title}
                    </h3>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors focus-ring"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl py-2 z-20 min-w-[160px] fade-in">
                      <button
                        onClick={handleDeleteList}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete list
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-slate-400">
                  {cardsForList.length} {cardsForList.length === 1 ? "card" : "cards"}
                </span>
              </div>
            </div>
          </div>

          {/* Cards Container */}
          <div
            ref={setDroppableRef}
            className="flex-1 p-5 space-y-4 min-h-[150px] max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar"
          >
            <SortableContext items={cardsForList.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {cardsForList.length === 0 && !showAddCard ? (
                <div className="text-center py-12 text-gray-400 dark:text-slate-400">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold mb-3">No cards yet</p>
                  <button
                    onClick={() => handleAddCard()}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    Add your first card
                  </button>
                </div>
              ) : (
                <>
                  {showAddCard && addCardIndex === 0 && (
                    <div className="mb-4">
                      <AddCardForm listId={list.id} onCancel={handleAddCardComplete} onAdd={handleAddCardComplete} />
                    </div>
                  )}

                  {cardsForList.map((card, index) => (
                    <div key={card.id}>
                      <KanbanCard card={card} onClick={() => handleCardClick(card)} />

                      {/* Add card button between cards */}
                      <div className="flex justify-center py-3 opacity-0 hover:opacity-100 transition-opacity group">
                        <button
                          onClick={() => handleAddCard(index + 1)}
                          className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200 transform hover:scale-110"
                          title="Add card here"
                        >
                          <Plus className="w-5 h-5 text-gray-400 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                        </button>
                      </div>

                      {showAddCard && addCardIndex === index + 1 && (
                        <div className="my-4">
                          <AddCardForm
                            listId={list.id}
                            onCancel={handleAddCardComplete}
                            onAdd={handleAddCardComplete}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {showAddCard && addCardIndex === -1 && (
                    <div className="mt-4">
                      <AddCardForm listId={list.id} onCancel={handleAddCardComplete} onAdd={handleAddCardComplete} />
                    </div>
                  )}
                </>
              )}
            </SortableContext>
          </div>

          {/* Add Card at Bottom */}
          {!showAddCard && (
            <div className="p-5 border-t border-gray-100 dark:border-slate-700/30 bg-gradient-to-r from-transparent to-white/50 dark:to-slate-800/50">
              <button
                onClick={() => handleAddCard()}
                className="w-full flex items-center gap-3 p-4 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200 group focus-ring border-2 border-dashed border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 font-medium"
              >
                <Plus className="w-5 h-5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors group-hover:scale-110" />
                <span className="text-sm font-semibold">Add a card</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Modal */}
      {showCardModal && selectedCard && (
        <CardModal isOpen={showCardModal} onClose={handleCardModalClose} card={selectedCard} listId={list.id} />
      )}
    </>
  )
}

export default KanbanList

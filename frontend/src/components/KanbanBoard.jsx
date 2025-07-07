"use client"
import { useState } from "react"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus, Trello } from "lucide-react"
import useBoardStore from "../store/boardStore"
import KanbanList from "./KanbanList"
import KanbanCard from "./KanbanCard"
import AddListForm from "./AddListForm"

const KanbanBoard = ({ onCardClick }) => {
  const { getCurrentBoard, moveCard, moveList } = useBoardStore()
  const [activeCard, setActiveCard] = useState(null)
  const [activeList, setActiveList] = useState(null)
  const [showAddList, setShowAddList] = useState(false)

  const board = getCurrentBoard()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event) => {
    const { active } = event
    const { data } = active

    if (data.current?.type === "card") {
      setActiveCard(data.current.card)
    } else if (data.current?.type === "list") {
      setActiveList(data.current.list)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    const draggedCard = activeCard
    const draggedList = activeList

    setActiveCard(null)
    setActiveList(null)

    if (!over || !board) return

    const activeData = active.data.current
    const overData = over.data.current

    // Handle card movement
    if (activeData?.type === "card" && draggedCard) {
      const cardId = active.id
      let sourceListId = null
      let destinationListId = null
      let destinationIndex = 0

      // Find source list
      board.lists.forEach((list) => {
        if (list.cards.find((c) => c.id === cardId)) {
          sourceListId = list.id
        }
      })

      // Determine destination based on what was dropped on
      if (overData?.type === "list") {
        // Dropped on a list
        destinationListId = over.id
        destinationIndex = board.lists.find((l) => l.id === over.id)?.cards.length || 0
      } else if (overData?.type === "card") {
        // Dropped on a card
        board.lists.forEach((list) => {
          const cardIndex = list.cards.findIndex((c) => c.id === over.id)
          if (cardIndex !== -1) {
            destinationListId = list.id
            destinationIndex = cardIndex
          }
        })
      } else {
        // Dropped on something else - try to find the closest list
        const listElement = document
          .elementFromPoint(event.activatorEvent?.clientX || 0, event.activatorEvent?.clientY || 0)
          ?.closest("[data-list-id]")
        if (listElement) {
          destinationListId = listElement.getAttribute("data-list-id")
          const destinationList = board.lists.find((l) => l.id === destinationListId)
          destinationIndex = destinationList?.cards.length || 0
        } else {
          // If no valid drop target found, keep the card in its original position
          return
        }
      }

      // Only move if we have valid source and destination
      if (sourceListId && destinationListId) {
        moveCard(board.id, cardId, sourceListId, destinationListId, destinationIndex)
      }
    }

    // Handle list movement
    if (activeData?.type === "list" && overData?.type === "list" && draggedList) {
      const activeIndex = board.lists.findIndex((l) => l.id === active.id)
      const overIndex = board.lists.findIndex((l) => l.id === over.id)

      if (activeIndex !== undefined && overIndex !== undefined && activeIndex !== overIndex) {
        moveList(board.id, activeIndex, overIndex)
      }
    }
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700/20 rounded-2xl flex items-center justify-center mx-auto">
            <Trello className="w-8 h-8 text-gray-400 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">No board selected</h2>
            <p className="text-gray-600 dark:text-slate-400">Create a new board to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-200">
      <div className="h-full flex flex-col">
        {/* Board Header */}
        <div className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center space-x-4 mb-2">
            <div className={`w-4 h-4 rounded-full ${board.color || "bg-blue-500"}`} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{board.title}</h1>
          </div>
          <p className="text-gray-600 dark:text-slate-400 text-base">
            {board.description || "Organize your tasks and boost productivity"}
          </p>
        </div>

        {/* Board Content with Fixed Horizontal Scroll */}
        <div className="flex-1 min-h-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full overflow-x-auto overflow-y-hidden px-6 pb-6">
              <div className="flex gap-6 h-full" style={{ minWidth: "max-content" }}>
                <SortableContext items={board.lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
                  {board.lists.map((list) => (
                    <KanbanList
                      key={list.id}
                      list={list}
                      boardId={board.id}
                      onCardClick={onCardClick}
                      data-list-id={list.id}
                    />
                  ))}
                </SortableContext>

                {/* Add List */}
                <div className="flex-shrink-0 w-72">
                  {showAddList ? (
                    <AddListForm
                      boardId={board.id}
                      onCancel={() => setShowAddList(false)}
                      onAdd={() => setShowAddList(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setShowAddList(true)}
                      className="w-full h-fit bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500/50 rounded-xl p-6 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-100 transition-all duration-200 flex items-center justify-center gap-3 min-h-[100px] group focus-ring"
                    >
                      <Plus className="w-5 h-5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      <span className="font-medium text-base">Add another list</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <DragOverlay>
              {activeCard ? (
                <div className="rotate-2 opacity-90">
                  <KanbanCard card={activeCard} isDragging />
                </div>
              ) : activeList ? (
                <div className="rotate-1 opacity-90">
                  <KanbanList list={activeList} boardId={board.id} onCardClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  )
}

export default KanbanBoard

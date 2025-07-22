"use client"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus, Palette } from "lucide-react"
import useBoardStore from "../store/boardStore"
import useListStore from "../store/listStore"
import useCardStore from "../store/cardStore"
import KanbanList from "./KanbanList"
import KanbanCard from "./KanbanCard"
import AddListForm from "./AddListForm"
import BackgroundThemeSelector from "./BackgroundThemeSelector"

const KanbanBoard = ({ onCardClick }) => {
  const { id } = useParams()
  const { boards, currentBoardId, setCurrentBoard, fetchBoards, getCurrentBoard, editBoard } = useBoardStore()
  const board = getCurrentBoard()
  const boardId = id

  // 1️⃣ Fetch all boards once on mount
  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  // 2️⃣ When URL changes (or after boards load), sync URL → store
  useEffect(() => {
    if (id && boards.length) {
      setCurrentBoard(Number(id))
    }
  }, [id, boards, setCurrentBoard])

  // ✅ THE FIX: Pull all from the Zustand list store
  const { lists, fetchLists, setLists, updateList } = useListStore()
  const { cards, setCardsForList, updateCard } = useCardStore()

  const [activeCard, setActiveCard] = useState(null)
  const [activeList, setActiveList] = useState(null)
  const [showAddList, setShowAddList] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)

  // Fetch lists when board changes
  useEffect(() => {
    if (boardId) fetchLists(boardId)
  }, [boardId, fetchLists])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 3 } }))

  const handleDragStart = (event) => {
    const { active } = event
    const { data } = active
    if (data.current?.type === "card") {
      setActiveCard(data.current.card)
    } else if (data.current?.type === "list") {
      setActiveList(data.current.list)
    }
  }

  const handleDragOver = (event) => {
    // (Implement card moving between lists if needed)
  }

  // ✅ Optimistic, persistent drag & drop ordering!
  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveCard(null)
    setActiveList(null)

    // --- Card Drag: Move between lists ---
    if (active.data.current?.type === "card" && over) {
      const activeCard = active.data.current.card
      const overListId = over.data.current?.list?.id
      if (overListId && activeCard.list !== overListId) {
        // Remove from old list
        const oldListCards = cards[activeCard.list] || []
        const newOldListCards = oldListCards.filter((c) => c.id !== activeCard.id)
        setCardsForList && setCardsForList(activeCard.list, newOldListCards)

        // Add to new list at the top
        const newListCards = cards[overListId] || []
        const updatedCard = { ...activeCard, list: overListId }
        setCardsForList && setCardsForList(overListId, [updatedCard, ...newListCards])

        // Persist to backend
        await updateCard(activeCard.id, { list: overListId })
        return
      }
    }

    // --- List Drag: Move lists ---
    if (!over || active.id === over.id) return
    const oldIndex = lists.findIndex((l) => l.id === active.id)
    const newIndex = lists.findIndex((l) => l.id === over.id)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
    const newLists = [...lists]
    const [moved] = newLists.splice(oldIndex, 1)
    newLists.splice(newIndex, 0, moved)
    const orderedLists = newLists.map((list, idx) => ({ ...list, order: idx }))
    setLists(orderedLists)
    await Promise.all(orderedLists.map((list) => updateList(list.id, { order: list.order })))
  }

  const handleThemeChange = async (theme) => {
    if (board) {
      await editBoard(board.id, {
        ...board,
        background_theme: theme, // use snake_case for backend
      })
      setShowThemeSelector(false)
    }
  }

  const getBackgroundStyle = () => {
    const theme = board?.background_theme;
    if (!theme || theme.type === "default") {
      return {
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      };
    }

    // Handle image backgrounds
    if (theme.url || theme.type === "image") {
      return {
        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${theme.url}) center/cover no-repeat fixed`,
      };
    }

    if (theme.pattern) {
      return {
        backgroundImage: `${theme.pattern}, ${theme.value}`,
        backgroundSize: theme.patternSize || "20px 20px",
      };
    }

    return {
      background: theme.value,
    };
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full" style={getBackgroundStyle()}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-white/40 rounded" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white drop-shadow-lg mb-2">No board selected</h2>
            <p className="text-white/80 drop-shadow">Create a new board to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full transition-all duration-700 ease-in-out relative overflow-hidden"
      style={getBackgroundStyle()}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="h-full flex flex-col relative z-10">
        {/* Board Header */}
        <div className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className={`w-6 h-6 rounded-full ${board.color || "bg-blue-500"} ring-2 ring-white/50 shadow-lg`} />
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">{board.title}</h1>
            </div>
            <button
              onClick={() => setShowThemeSelector(true)}
              className="flex items-center gap-3 px-5 py-3 bg-white/15 backdrop-blur-md hover:bg-white/25 text-white rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl font-medium"
            >
              <Palette className="w-5 h-5" />
              <span>Change Background</span>
            </button>
          </div>
          <p className="text-white/90 text-base drop-shadow max-w-2xl">
            {board.description || "Organize your tasks and boost productivity"}
          </p>
        </div>

        {/* Board Content */}
        <div className="flex-1 min-h-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full overflow-x-auto overflow-y-hidden px-6 pb-6 custom-scrollbar">
              <div className="flex gap-6 h-full" style={{ minWidth: "max-content" }}>
                <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
                  {lists.map((list) => (
                    <KanbanList
                      key={list.id}
                      list={list}
                      boardId={board.id}
                      onCardClick={onCardClick}
                      allLists={lists} // Pass all lists for cross-list DnD
                      data-list-id={list.id}
                    />
                  ))}
                </SortableContext>

                {/* Add List */}
                <div className="flex-shrink-0 w-80">
                  {showAddList ? (
                    <AddListForm
                      boardId={board.id}
                      onCancel={() => setShowAddList(false)}
                      onAdd={() => setShowAddList(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setShowAddList(true)}
                      className="w-full h-fit bg-white/10 backdrop-blur-md border-2 border-dashed border-white/30 hover:border-white/50 hover:bg-white/20 rounded-2xl p-8 text-white/80 hover:text-white transition-all duration-200 flex items-center justify-center gap-4 min-h-[140px] group focus-ring shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-7 h-7 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-lg">Add another list</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <DragOverlay>
              {activeCard ? (
                <div className="rotate-2 opacity-95 transform scale-105 transition-transform shadow-2xl">
                  <KanbanCard card={activeCard} isDragging />
                </div>
              ) : activeList ? (
                <div className="rotate-1 opacity-95 transform scale-105 transition-transform shadow-2xl">
                  <KanbanList list={activeList} boardId={board.id} onCardClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Background Theme Selector Modal */}
      {showThemeSelector && (
        <BackgroundThemeSelector
          currentTheme={board?.background_theme} // use snake_case
          onThemeChange={handleThemeChange}
          onClose={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  )
}

export default KanbanBoard

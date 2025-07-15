"use client"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import useBoardStore from "../store/boardStore"
import useListStore from "../store/listStore"
import useCardStore from "../store/cardStore"
import KanbanList from "./KanbanList"
import KanbanCard from "./KanbanCard"
import AddListForm from "./AddListForm"

const KanbanBoard = ({ onCardClick }) => {
  const { id } = useParams();
  const { getCurrentBoard, setCurrentBoard, boards } = useBoardStore()
  const board = getCurrentBoard()
  const boardId = board?.id

  // Auto-select board based on URL param
  useEffect(() => {
    if (id && boards.length) {
      setCurrentBoard(Number(id));
    }
  }, [id, boards, setCurrentBoard]);

  // ✅ THE FIX: Pull all from the Zustand list store
  const { lists, fetchLists, setLists, updateList } = useListStore()
  const { cards, setCardsForList, updateCard } = useCardStore();

  const [activeCard, setActiveCard] = useState(null)
  const [activeList, setActiveList] = useState(null)
  const [showAddList, setShowAddList] = useState(false)

  // Fetch lists when board changes
  useEffect(() => {
    if (boardId) fetchLists(boardId)
  }, [boardId, fetchLists])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
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

  const handleDragOver = (event) => {
    // (Implement card moving between lists if needed)
  }

  // ✅ Optimistic, persistent drag & drop ordering!
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveList(null);

    // --- Card Drag: Move between lists ---
    if (active.data.current?.type === "card" && over) {
      const activeCard = active.data.current.card;
      const overListId = over.data.current?.list?.id;
      if (overListId && activeCard.list !== overListId) {
        // Remove from old list
        const oldListCards = cards[activeCard.list] || [];
        const newOldListCards = oldListCards.filter((c) => c.id !== activeCard.id);
        setCardsForList && setCardsForList(activeCard.list, newOldListCards);

        // Add to new list at the top
        const newListCards = cards[overListId] || [];
        const updatedCard = { ...activeCard, list: overListId };
        setCardsForList && setCardsForList(overListId, [updatedCard, ...newListCards]);

        // Persist to backend
        await updateCard(activeCard.id, { list: overListId });
        return;
      }
    }

    // --- List Drag: Move lists ---
    if (!over || active.id === over.id) return;
    const oldIndex = lists.findIndex((l) => l.id === active.id);
    const newIndex = lists.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    const newLists = [...lists];
    const [moved] = newLists.splice(oldIndex, 1);
    newLists.splice(newIndex, 0, moved);
    const orderedLists = newLists.map((list, idx) => ({ ...list, order: idx }));
    setLists(orderedLists);
    await Promise.all(orderedLists.map((list) => updateList(list.id, { order: list.order })));
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700/20 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-gray-400 dark:bg-slate-400 rounded" />
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

        {/* Board Content with Custom Scrollbar */}
        <div className="flex-1 min-h-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full overflow-x-auto overflow-y-hidden px-6 pb-6 custom-scrollbar">
              <div className="flex gap-6 h-full" style={{ minWidth: "max-content" }}>
              <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
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
                <div className="rotate-2 opacity-90 transform scale-105 transition-transform">
                  <KanbanCard card={activeCard} isDragging />
                </div>
              ) : activeList ? (
                <div className="rotate-1 opacity-90 transform scale-105 transition-transform">
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

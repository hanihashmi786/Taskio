"use client";
import { useState, useEffect } from "react";
import { X, Plus, CheckSquare, MessageCircle, Users } from "lucide-react";
import LabelSelector from "./LabelSelector";
import useCardStore from "../store/cardStore";
import useBoardStore from "../store/boardStore"; // for members

const CardModal = ({ card, listId, onClose }) => {
  const { updateCard, fetchComments, comments, addComment, deleteComment } = useCardStore();
  const { board } = useBoardStore();
  const [form, setForm] = useState({
    ...card,
    labels: card.labels || [],
    assignees: card.assignees || [],
    checklist: card.checklist || [],
  });
  const [showLabelSel, setShowLabelSel] = useState(false);
  const [newChecklist, setNewChecklist] = useState("");
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchComments(card.id);
  }, [card.id, fetchComments]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Checklist
  const addChecklistItem = () => {
    if (!newChecklist.trim()) return;
    handleChange("checklist", [
      ...(form.checklist || []),
      { text: newChecklist, completed: false },
    ]);
    setNewChecklist("");
  };
  const toggleChecklistItem = (idx) => {
    handleChange("checklist", form.checklist.map((item, i) =>
      i === idx ? { ...item, completed: !item.completed } : item
    ));
  };
  const removeChecklistItem = (idx) => {
    handleChange("checklist", form.checklist.filter((_, i) => i !== idx));
  };

  // Labels
  const openLabelSel = () => setShowLabelSel(true);

  // Assignees
  const toggleAssignee = (userId) => {
    handleChange("assignees", form.assignees.includes(userId)
      ? form.assignees.filter((id) => id !== userId)
      : [...form.assignees, userId]
    );
  };

  // Comments
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(card.id, { text: newComment });
    setNewComment("");
    fetchComments(card.id); // reload
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    await updateCard(card.id, { ...form });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full shadow-xl border">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="text-xl font-bold">{form.title}</div>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        <div className="p-4 space-y-4">
          <input
            className="w-full border rounded p-2"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <textarea
            className="w-full border rounded p-2"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
          />
          <div>
            <button
              type="button"
              className="btn-secondary mb-2"
              onClick={openLabelSel}
            >
              Edit Labels
            </button>
            {form.labels && (
              <div className="flex gap-2 flex-wrap">
                {form.labels.map((id) => (
                  <span key={id} className="bg-blue-200 px-2 rounded text-xs">{id}</span>
                ))}
              </div>
            )}
          </div>
          {/* Checklist */}
          <div>
            <div className="font-bold mb-2 flex items-center gap-1">
              <CheckSquare className="w-4 h-4" /> Checklist
            </div>
            <ul className="space-y-1">
              {form.checklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(idx)}
                  />
                  <span className={item.completed ? "line-through text-gray-400" : ""}>{item.text}</span>
                  <button onClick={() => removeChecklistItem(idx)} className="text-red-500"><X /></button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-1">
              <input
                className="flex-1 border rounded p-1"
                value={newChecklist}
                onChange={(e) => setNewChecklist(e.target.value)}
                placeholder="New checklist item"
              />
              <button onClick={addChecklistItem} className="btn-primary">Add</button>
            </div>
          </div>
          {/* Assignees */}
          <div>
            <div className="font-bold mb-2 flex items-center gap-1">
              <Users className="w-4 h-4" /> Assignees
            </div>
            <div className="flex gap-2 flex-wrap">
              {board?.members?.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleAssignee(u.id)}
                  className={`px-2 py-1 rounded ${form.assignees.includes(u.id) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  {u.username}
                </button>
              ))}
            </div>
          </div>
          {/* Comments */}
          <div>
            <div className="font-bold mb-2 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Comments
            </div>
            <div className="space-y-2">
              {(comments[card.id] || []).map((c) => (
                <div key={c.id} className="bg-gray-100 p-2 rounded">
                  <span className="font-bold">{c.author?.username || "User"}</span>: {c.text}
                  <button
                    className="text-xs text-red-400 ml-2"
                    onClick={() => deleteComment(card.id, c.id)}
                  >Delete</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 border rounded p-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
              />
              <button onClick={handleAddComment} className="btn-primary">Send</button>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        {showLabelSel && (
          <LabelSelector
            selectedLabels={form.labels}
            onLabelsChange={(labels) => {
              handleChange("labels", labels);
              setShowLabelSel(false);
            }}
            onClose={() => setShowLabelSel(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CardModal;

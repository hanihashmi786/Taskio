"use client";
import { useState } from "react";
import LabelSelector from "./LabelSelector";
import useCardStore from "../store/cardStore";

const AddCardForm = ({ listId, onAdd, onCancel }) => {
  const { addCard } = useCardStore();
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    labels: [],
    assignees: [],
    checklist: [],
  });
  const [showLabelSel, setShowLabelSel] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await addCard({
      ...form,
      list: listId,
    });
    setSaving(false);
    setForm({ title: "", description: "", due_date: "", labels: [], assignees: [], checklist: [] });
    onAdd && onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow space-y-4">
      <input
        className="w-full p-2 border rounded"
        placeholder="Card title"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
        required
      />
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Description"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />
      <input
        type="date"
        className="w-full p-2 border rounded"
        value={form.due_date}
        onChange={(e) => handleChange("due_date", e.target.value)}
      />
      <div>
        <button
          type="button"
          onClick={() => setShowLabelSel(true)}
          className="text-blue-600 underline"
        >
          Select Labels
        </button>
        {form.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.labels.map((id) => (
              <span key={id} className="bg-blue-200 text-blue-800 rounded px-2 py-1 text-xs">{id}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Add Card"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
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
    </form>
  );
};

export default AddCardForm;

"use client";
import { useState, useEffect } from "react";
import { getLabels } from "../api/labels";
import { X, Tag } from "lucide-react";

const LabelSelector = ({ selectedLabels, onLabelsChange, onClose }) => {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    getLabels().then((res) => setLabels(res.data));
  }, []);

  const toggleLabel = (labelId) => {
    if (selectedLabels.includes(labelId)) {
      onLabelsChange(selectedLabels.filter((id) => id !== labelId));
    } else {
      onLabelsChange([...selectedLabels, labelId]);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl w-full max-w-sm relative">
        <button
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Tag className="w-5 h-5" /> Pick Labels
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {labels.map((label) => (
            <button
              key={label.id}
              onClick={() => toggleLabel(label.id)}
              className={`rounded py-2 px-3 text-sm flex items-center gap-2 border transition-colors ${
                selectedLabels.includes(label.id)
                  ? "bg-blue-100 border-blue-400 font-semibold"
                  : "bg-gray-50 dark:bg-slate-700/30 border-gray-200"
              }`}
            >
              <span
                style={{
                  background: label.color,
                  color: label.textColor,
                  borderRadius: 8,
                  display: "inline-block",
                  width: 18,
                  height: 18,
                }}
              ></span>
              {label.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabelSelector;

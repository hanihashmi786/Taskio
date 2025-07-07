export const PREDEFINED_LABELS = [
  { id: "high-priority", name: "High Priority", color: "bg-red-500", textColor: "text-white" },
  { id: "medium-priority", name: "Medium Priority", color: "bg-orange-500", textColor: "text-white" },
  { id: "low-priority", name: "Low Priority", color: "bg-yellow-500", textColor: "text-black" },
  { id: "bug", name: "Bug", color: "bg-red-600", textColor: "text-white" },
  { id: "feature", name: "Feature", color: "bg-blue-500", textColor: "text-white" },
  { id: "enhancement", name: "Enhancement", color: "bg-purple-500", textColor: "text-white" },
  { id: "design", name: "Design", color: "bg-pink-500", textColor: "text-white" },
  { id: "development", name: "Development", color: "bg-green-500", textColor: "text-white" },
  { id: "testing", name: "Testing", color: "bg-indigo-500", textColor: "text-white" },
  { id: "documentation", name: "Documentation", color: "bg-gray-500", textColor: "text-white" },
  { id: "research", name: "Research", color: "bg-cyan-500", textColor: "text-white" },
  { id: "urgent", name: "Urgent", color: "bg-red-700", textColor: "text-white" },
]

export const getLabelById = (id) => {
  return PREDEFINED_LABELS.find((label) => label.id === id)
}

export const getLabelColor = (labelId) => {
  const label = getLabelById(labelId)
  return label ? label.color : "bg-gray-500"
}

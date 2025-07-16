export const PREDEFINED_LABELS = [
  { id: 1, name: "High Priority", color: "bg-red-500", textColor: "text-white" },
  { id: 2, name: "Medium Priority", color: "bg-orange-500", textColor: "text-white" },
  { id: 3, name: "Low Priority", color: "bg-yellow-500", textColor: "text-black" },
  { id: 4, name: "Bug", color: "bg-red-600", textColor: "text-white" },
  { id: 5, name: "Feature", color: "bg-blue-500", textColor: "text-white" },
  { id: 6, name: "Enhancement", color: "bg-purple-500", textColor: "text-white" },
  { id: 7, name: "Design", color: "bg-pink-500", textColor: "text-white" },
  { id: 8, name: "Development", color: "bg-green-500", textColor: "text-white" },
  { id: 9, name: "Testing", color: "bg-indigo-500", textColor: "text-white" },
  { id: 10, name: "Documentation", color: "bg-gray-500", textColor: "text-white" },
  { id: 11, name: "Research", color: "bg-cyan-500", textColor: "text-white" },
  { id: 12, name: "Urgent", color: "bg-red-700", textColor: "text-white" },
]

export const getLabelById = (id) => {
  return PREDEFINED_LABELS.find((label) => label.id === id)
}

export const getLabelColor = (labelId) => {
  const label = getLabelById(labelId)
  return label ? label.color : "bg-gray-500"
}

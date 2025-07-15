export const PREDEFINED_LABELS = [
  { id: 14, name: "High Priority", color: "bg-red-500", textColor: "text-white" },
  { id: 15, name: "Medium Priority", color: "bg-orange-500", textColor: "text-white" },
  { id: 16, name: "Low Priority", color: "bg-yellow-500", textColor: "text-black" },
  { id: 17, name: "Bug", color: "bg-red-600", textColor: "text-white" },
  { id:18, name: "Feature", color: "bg-blue-500", textColor: "text-white" },
  { id: 19, name: "Enhancement", color: "bg-purple-500", textColor: "text-white" },
  { id: 20, name: "Design", color: "bg-pink-500", textColor: "text-white" },
  { id: 21, name: "Development", color: "bg-green-500", textColor: "text-white" },
  { id: 22, name: "Testing", color: "bg-indigo-500", textColor: "text-white" },
  { id: 23, name: "Documentation", color: "bg-gray-500", textColor: "text-white" },
  { id: 24, name: "Research", color: "bg-cyan-500", textColor: "text-white" },
  { id: 25, name: "Urgent", color: "bg-red-700", textColor: "text-white" },
]

export const getLabelById = (id) => {
  return PREDEFINED_LABELS.find((label) => label.id === id)
}

export const getLabelColor = (labelId) => {
  const label = getLabelById(labelId)
  return label ? label.color : "bg-gray-500"
}

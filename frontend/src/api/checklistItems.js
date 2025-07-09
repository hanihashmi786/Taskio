import API from "./index"
export const getChecklistItems = (cardId) => API.get(`checklist-items/?card=${cardId}`)
export const createChecklistItem = (data) => API.post("checklist-items/", data)
export const updateChecklistItem = (id, data) => API.patch(`checklist-items/${id}/`, data)
export const deleteChecklistItem = (id) => API.delete(`checklist-items/${id}/`)

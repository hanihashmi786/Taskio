import API from "./index"
export const getChecklistItems = (cardId) => API.get(`checklist-items/?card=${cardId}`)
export const createChecklistItem = (data) => API.post("checklist-items/", data)
export const updateChecklistItem = (id, data) => API.patch(`checklist-items/${id}/`, data)
export const deleteChecklistItem = (id) => API.delete(`checklist-items/${id}/`)

// Checklist API (not just items)
export const getChecklists = (cardId) => API.get(`checklists/?card=${cardId}`);
export const createChecklist = (data) => API.post("checklists/", data);

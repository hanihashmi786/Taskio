import API from "./index";

// Get all lists for a board
export const getLists = (boardId) => API.get(`lists/?board=${boardId}`);

// Create a list
export const createList = (data) => API.post("lists/", data);

// Update a list
export const updateList = (id, data) => API.patch(`lists/${id}/`, data);

// Delete a list
export const deleteList = (id) => API.delete(`lists/${id}/`);

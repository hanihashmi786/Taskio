import API from "./index";

// Get all boards
export function getBoards() {
  return API.get("boards/");
}

// Create a new board
export function createBoard(data) {
  return API.post("boards/", data);
}

// Update a board
export function updateBoard(boardId, data) {
  return API.patch(`boards/${boardId}/`, data);
}

// Delete a board
export function deleteBoard(boardId) {
  return API.delete(`boards/${boardId}/`);
}

// Get single board (with lists/cards)
export function getBoard(boardId) {
  return API.get(`boards/${boardId}/`);
}

    
import API from "./index"; // This is your axios instance

// Search users to add to board
export async function searchUsers(term, boardId) {
  const res = await API.get(`/accounts/search-users/?q=${encodeURIComponent(term)}&board=${boardId}`);
  return res.data; // Array of users
}

// Add member to board
export async function addBoardMember(boardId, userId, role = "member") {
  const res = await API.post("/accounts/add-board-member/", {
    board_id: boardId,
    user_id: userId,
    role,
  });
  return res.data;
}

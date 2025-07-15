import API from "./index";
export function getComments(cardId) {
  return API.get(`comments/?card=${cardId}`);
}
export function createComment(cardId, data) {
  return API.post(`comments/`, { ...data, card: cardId });
}
export function deleteComment(commentId) {
  return API.delete(`comments/${commentId}/`);
}

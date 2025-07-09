import API from "./index";

// Get cards for a list
export function getCards(listId) {
  return API.get(`cards/?list=${listId}`);
}

// Create a new card
export function createCard(data) {
  return API.post("cards/", data);
}

// Update a card
export function updateCard(cardId, data) {
  return API.patch(`cards/${cardId}/`, data);
}

// Delete a card
export function deleteCard(cardId) {
  return API.delete(`cards/${cardId}/`);
}

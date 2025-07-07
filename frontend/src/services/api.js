const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API service for authentication
export const authAPI = {
  // Sign up a new user
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/accounts/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Get current user (if you have an endpoint for this)
  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/accounts/user/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

// API service for boards (when you add board endpoints)
export const boardAPI = {
  // Get all boards for the current user
  getBoards: async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Create a new board
  createBoard: async (boardData) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(boardData),
    });
    return handleResponse(response);
  },

  // Update a board
  updateBoard: async (boardId, boardData) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(boardData),
    });
    return handleResponse(response);
  },

  // Delete a board
  deleteBoard: async (boardId) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

// API service for lists
export const listAPI = {
  // Create a new list
  createList: async (boardId, listData) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listData),
    });
    return handleResponse(response);
  },

  // Update a list
  updateList: async (boardId, listId, listData) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists/${listId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listData),
    });
    return handleResponse(response);
  },

  // Delete a list
  deleteList: async (boardId, listId) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists/${listId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

// API service for cards
export const cardAPI = {
  // Create a new card
  createCard: async (boardId, listId, cardData) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists/${listId}/cards/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });
    return handleResponse(response);
  },

  // Update a card
  updateCard: async (boardId, listId, cardId, cardData) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists/${listId}/cards/${cardId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });
    return handleResponse(response);
  },

  // Delete a card
  deleteCard: async (boardId, listId, cardId) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists/${listId}/cards/${cardId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

export default {
  auth: authAPI,
  boards: boardAPI,
  lists: listAPI,
  cards: cardAPI,
}; 
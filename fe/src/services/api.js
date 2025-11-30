// API Service for Backend Communication
const API_BASE_URL = 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
        'Content-Type': 'application/json',
        'x-user-id': user.id || ''
    };
};

// Auth APIs
export const authAPI = {
    login: async (username, password) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return response.json();
    },
    
    register: async (username, password, role = 'customer') => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });
        return response.json();
    }
};

// User APIs
export const userAPI = {
    getProfile: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    }
};

// Menu APIs
export const menuAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/menu`);
        return response.json();
    },
    
    add: async (menuItem) => {
        const response = await fetch(`${API_BASE_URL}/menu`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(menuItem)
        });
        return response.json();
    },
    
    delete: async (itemId) => {
        const response = await fetch(`${API_BASE_URL}/menu/${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    }
};

// Order APIs
export const orderAPI = {
    getById: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },
    
    getByUser: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },
    
    create: async (itemId, quantity = 1) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ item_id: itemId, quantity })
        });
        return response.json();
    }
};

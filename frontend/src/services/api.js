import axios from 'axios';

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ===========================
   AUTHENTICATION APIs
=========================== */
export const authAPI = {
  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  getProfile: async () => {
    try {
      const res = await api.get('/auth/profile');
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  }
};

/* ===========================
   WASTE MANAGEMENT APIs
=========================== */
export const wasteAPI = {
  classify: async (data) => {
    try {
      const res = await api.post('/waste/classify', data);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Classification failed' };
    }
  },

  getHistory: async (page = 1, limit = 10) => {
    try {
      const res = await api.get(`/waste/history?page=${page}&limit=${limit}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch history' };
    }
  },

  getStats: async () => {
    try {
      const res = await api.get('/waste/stats');
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  },

  search: async (query) => {
    try {
      const res = await api.get(`/waste/search?q=${query}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Search failed' };
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/waste/${id}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete record' };
    }
  }
};

/* ===========================
   PICKUP MANAGEMENT APIs
=========================== */
export const pickupAPI = {
  schedule: async (data) => {
    try {
      const res = await api.post('/pickup/schedule', data);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to schedule pickup' };
    }
  },

  getMyPickups: async (status = '', page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      const res = await api.get(`/pickup/my-pickups?${params}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pickups' };
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/pickup/${id}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pickup details' };
    }
  },

  cancel: async (id) => {
    try {
      const res = await api.put(`/pickup/${id}/cancel`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel pickup' };
    }
  },

  complete: async (id, data) => {
    try {
      const res = await api.put(`/pickup/${id}/complete`, data);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to complete pickup' };
    }
  },

  getStats: async () => {
    try {
      const res = await api.get('/pickup/stats');
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pickup statistics' };
    }
  }
};

/* ===========================
   INDUSTRY WASTE APIs
=========================== */
export const industryAPI = {
  submitDeclaration: async (data) => {
    try {
      const res = await api.post('/industry/waste/declare', data);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit declaration' };
    }
  },

  getDeclarations: async (status = '', year = '', page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      if (year) params.append('year', year);
      const res = await api.get(`/industry/waste/declarations?${params}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch declarations' };
    }
  },

  getDeclarationById: async (id) => {
    try {
      const res = await api.get(`/industry/waste/declarations/${id}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch declaration' };
    }
  },

  trackWaste: async (trackingId) => {
    try {
      const res = await api.get(`/industry/waste/track/${trackingId}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to track waste' };
    }
  },

  getStats: async () => {
    try {
      const res = await api.get('/industry/waste/stats');
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  },

  getCertificate: async (declarationId) => {
    try {
      const res = await api.get(`/industry/waste/certificate/${declarationId}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate certificate' };
    }
  },

  deleteDeclaration: async (id) => {
    try {
      const res = await api.delete(`/industry/waste/${id}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete declaration' };
    }
  }
};

// Export axios instance
export default api;

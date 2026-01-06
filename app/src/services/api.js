import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 seconds for build operations
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add any auth headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

// Build Service
export const buildService = {
    /**
     * Start a new build
     * @param {FormData} formData - Form data with build configuration
     * @returns {Promise<Object>} Build response with buildId
     */
    async startBuild(data) {
        const response = await api.post('/api/build', data);
        return response;
    },

    /**
     * Get build status
     * @param {string} buildId - Build ID
     * @returns {Promise<Object>} Build status object
     */
    async getBuildStatus(buildId) {
        return api.get(`/api/build/${buildId}`);
    },

    /**
     * Get build logs
     * @param {string} buildId - Build ID
     * @returns {Promise<Array>} Build logs array
     */
    async getBuildLogs(buildId) {
        return api.get(`/api/build/${buildId}/logs`);
    },

    /**
     * Get download URL for completed build
     * @param {string} buildId - Build ID
     * @returns {Promise<string>} Download URL
     */
    async getDownloadUrl(buildId) {
        const response = await api.get(`/api/build/${buildId}/download`);
        return response.downloadUrl;
    },
};

// Push Notification Service
export const pushService = {
    /**
     * Send push notification
     * @param {string} expoPushToken - Expo push token
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {Object} data - Additional data payload
     * @returns {Promise<Object>} Response
     */
    async sendNotification(expoPushToken, title, body, data = {}) {
        return api.post('/api/push/send', {
            expoPushToken,
            title,
            body,
            data,
        });
    },
};

export default api;

import axios from "axios"

// Create axios instance with base URL
const api = axios.create({
  baseURL: "https://it342-g5-collaboraid.onrender.com/api",
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Tasks API
export const tasksApi = {
  getOpenTasks: () => api.get("/task/open"),
  getPostedTasksByUser: (userId: string | number) => api.get(`/tasks/user/${userId}/posted`),
  getAcceptedTasksByUser: (userId: string | number) => api.get(`/tasks/user/${userId}/accepted`),
  createTask: (taskData: any) => api.post("/tasks", taskData),
  updateTask: (taskId: number, taskData: any) => api.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId: number) => api.delete(`/tasks/${taskId}`),
}

// Messages API
export const messagesApi = {
  getReceivedMessages: () => api.get("/messages/received"),
  sendMessage: (messageData: any) => api.post("/messages", messageData),
  markAsRead: (messageId: number) => api.put(`/messages/${messageId}/read`),
}

// Notifications API
export const notificationsApi = {
  getUserNotifications: () => api.get("/notifications/user"),
  markAsRead: (notificationId: number) => api.put(`/notifications/${notificationId}/read`),
}

// User API
export const userApi = {
  getUserProfile: (userId: string | number) => api.get(`/users/${userId}`),
  updateUserProfile: (userId: string | number, userData: any) => api.put(`/users/${userId}`, userData),
  changePassword: (passwordData: any) => api.put("/users/password", passwordData),
}

export default api

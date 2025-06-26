package com.example.collaboraid.repository

import com.example.collaboraid.api.RetrofitClient
import com.example.collaboraid.model.Task
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class TaskRepository(private val sessionManager: SessionManager) {

    suspend fun getOpenTasks(): Result<List<Task>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            val response = RetrofitClient.taskService.getOpenTasks("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get open tasks: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getInProgressTasks(): Result<List<Task>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            val response = RetrofitClient.taskService.getInProgressTasks("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get in-progress tasks: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDoneTasks(): Result<List<Task>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            val response = RetrofitClient.taskService.getDoneTasks("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get done tasks: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTaskById(taskId: Long): Result<Task> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            val response = RetrofitClient.taskService.getTaskById(taskId, "Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get task: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createTask(title: String, description: String, category: String): Result<Task> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            val userId = sessionManager.getUserId() ?: return@withContext Result.failure(Exception("No user ID found"))

            val task = Task(
                title = title,
                description = description,
                category = category
            )

            val response = RetrofitClient.taskService.createTask(task, userId, "Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create task: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun acceptTask(taskId: Long): Result<Task> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            val userId = sessionManager.getUserId() ?: return@withContext Result.failure(Exception("No user ID found"))

            val response = RetrofitClient.taskService.acceptTask(taskId, userId, "Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to accept task: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun requestMarkAsDone(taskId: Long): Result<String> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            val userId = sessionManager.getUserId() ?: return@withContext Result.failure(Exception("No user ID found"))

            val response = RetrofitClient.taskService.requestMarkAsDone(taskId, userId, "Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to request mark as done: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun confirmTaskDone(taskId: Long): Result<String> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            val userId = sessionManager.getUserId() ?: return@withContext Result.failure(Exception("No user ID found"))

            val response = RetrofitClient.taskService.confirmTaskDone(taskId, userId, "Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to confirm task done: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Updated to use the new endpoints that don't require userId
    suspend fun getAcceptedTasksByUser(): Result<List<Task>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))

            // No longer need to pass userId - it's extracted from the token on the server
            val response = RetrofitClient.taskService.getAcceptedTasksByUser("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get accepted tasks: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Updated to use the new endpoint for task history
    suspend fun getTaskHistoryByUser(): Result<List<Task>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))

            // No longer need to pass userId - it's extracted from the token on the server
            val response = RetrofitClient.taskService.getTaskHistoryByUser("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get task history: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Updated to use the new endpoint for posted tasks
    suspend fun getTasksPostedByUser(): Result<List<Task>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))

            // No longer need to pass userId - it's extracted from the token on the server
            val response = RetrofitClient.taskService.getTasksPostedByUser("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get posted tasks: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
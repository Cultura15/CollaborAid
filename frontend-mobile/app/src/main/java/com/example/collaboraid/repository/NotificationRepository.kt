package com.example.collaboraid.repository

import com.example.collaboraid.api.NotificationService
import com.example.collaboraid.api.RetrofitClient
import com.example.collaboraid.model.Notification
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class NotificationRepository(private val sessionManager: SessionManager) {

    // Use the direct notificationService property from RetrofitClient
    private val notificationService = RetrofitClient.notificationService

    suspend fun getAllNotifications(): Result<List<Notification>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("User not authenticated"))
            val notifications = notificationService.getNotifications("Bearer $token")
            Result.success(notifications)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun markAsRead(notificationId: Long): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("User not authenticated"))
            notificationService.markAsRead("Bearer $token", notificationId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteNotification(notificationId: Long): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("User not authenticated"))
            notificationService.deleteNotification("Bearer $token", notificationId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun clearAllNotifications(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("User not authenticated"))
            notificationService.clearAllNotifications("Bearer $token")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun markAllAsRead(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("User not authenticated"))
            notificationService.markAllAsRead("Bearer $token")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

package com.example.collaboraid.api

import com.example.collaboraid.model.Notification
import retrofit2.http.*

interface NotificationService {

    @GET("notifications/user")
    suspend fun getNotifications(
        @Header("Authorization") token: String
    ): List<Notification>

    @PUT("notifications/{notificationId}/read")
    suspend fun markAsRead(
        @Header("Authorization") token: String,
        @Path("notificationId") notificationId: Long
    )

    @DELETE("notifications/{notificationId}")
    suspend fun deleteNotification(
        @Header("Authorization") token: String,
        @Path("notificationId") notificationId: Long
    )

    @DELETE("notifications/clear")
    suspend fun clearAllNotifications(
        @Header("Authorization") token: String
    )

    @PUT("notifications/mark-all-read")
    suspend fun markAllAsRead(
        @Header("Authorization") token: String
    )
}

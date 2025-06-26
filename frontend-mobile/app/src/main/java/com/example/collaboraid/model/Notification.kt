package com.example.collaboraid.model

import kotlinx.serialization.Serializable

@Serializable
data class Notification(
    val id: Long,
    val title: String = "", // Default empty string for backward compatibility
    val message: String,
    val type: String,
    val isRead: Boolean = false,
    val timestamp: String = "",
    val taskId: Long? = null,
    val userId: Long? = null
)

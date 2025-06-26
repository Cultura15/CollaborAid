package com.example.collaboraid.model

import kotlinx.serialization.Serializable

@Serializable
data class AuthResponse(
    val token: String,
    val user: UserInfo
)

@Serializable
data class UserInfo(
    val id: Long,
    val username: String,
    val role: String,
    val email: String? = null,
    val profilePictureUrl: String? = null
)


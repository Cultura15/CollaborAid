package com.example.collaboraid.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: Long? = null,
    val username: String = "",
    val email: String = "",
    val password: String = "",
    val role: String = "USER",
    val bio: String = "",
    val profilePicture: String? = null
)

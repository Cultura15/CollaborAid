package com.example.collaboraid.model

import kotlinx.serialization.Serializable

@Serializable
data class GoogleLoginResponse(
    val token: String,
    val user: UserInfo
)
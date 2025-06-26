package com.example.collaboraid.api

import com.example.collaboraid.model.AuthRequest
import com.example.collaboraid.model.AuthResponse
import com.example.collaboraid.model.GoogleLoginRequest
import com.example.collaboraid.model.GoogleLoginResponse
import com.example.collaboraid.model.User
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface AuthService {
    @POST("auth/login")
    suspend fun login(@Body authRequest: AuthRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body user: User): Response<User>

    @GET("auth/token-login")
    suspend fun validateToken(@Header("Authorization") token: String): Response<AuthResponse>

    @POST("auth/google-login/android")
    suspend fun googleLoginAndroidSimple(@Body requestBody: Map<String, String>): Response<GoogleLoginResponse>

}

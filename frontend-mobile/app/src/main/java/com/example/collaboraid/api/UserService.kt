package com.example.collaboraid.api

import com.example.collaboraid.model.User
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part

interface UserService {
    @GET("auth/current-user")
    suspend fun getCurrentUser(
        @Header("Authorization") authToken: String
    ): Response<User>

    @PUT("auth/update")
    suspend fun updateUserDetails(
        @Body user: User,
        @Header("Authorization") authToken: String
    ): Response<User>

    @Multipart
    @POST("auth/upload-profile-picture")
    suspend fun uploadProfilePicture(
        @Part file: MultipartBody.Part,
        @Header("Authorization") authToken: String
    ): Response<String>
}

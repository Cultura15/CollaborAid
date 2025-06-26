package com.example.collaboraid.api

import com.example.collaboraid.util.SessionManager
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // Base URL for the API
    private const val BASE_URL = "https://it342-g5-collaboraid.onrender.com/api/"

    // Static SessionManager for token management
    object SessionManager {
        private var token: String? = null

        fun getToken(): String? = token
        fun setToken(newToken: String?) {
            token = newToken
        }
    }

    // Create OkHttpClient with interceptors
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .addInterceptor(Interceptor { chain ->
            val original = chain.request()
            val token = SessionManager.getToken()

            val request = if (token != null) {
                original.newBuilder()
                    .header("Authorization", "Bearer $token")
                    .method(original.method, original.body)
                    .build()
            } else {
                original
            }

            chain.proceed(request)
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    // Configure JSON serialization
    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    // Create Retrofit instance
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    // Create API services
    val authService: AuthService = retrofit.create(AuthService::class.java)
    val taskService: TaskService = retrofit.create(TaskService::class.java)
    val messageService: MessageService = retrofit.create(MessageService::class.java)
    val notificationService: NotificationService = retrofit.create(NotificationService::class.java)
    val userService: UserService = retrofit.create(UserService::class.java)
    val aiService: AIService = retrofit.create(AIService::class.java)
}

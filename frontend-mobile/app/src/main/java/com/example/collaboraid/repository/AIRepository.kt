package com.example.collaboraid.repository

import android.util.Log
import com.example.collaboraid.api.AIMessageRequest
import com.example.collaboraid.api.RetrofitClient
import com.example.collaboraid.api.User
import com.example.collaboraid.model.AIMessage
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AIRepository(private val sessionManager: SessionManager) {

    private val TAG = "AIRepository"

    suspend fun askAI(userMessage: String): Result<AIMessage> = withContext(Dispatchers.IO) {
        try {
            val userId = sessionManager.getUserId()
            val username = sessionManager.getUsername()

            Log.d(TAG, "Asking AI with userId: $userId, username: $username")

            if (userId == null) {
                Log.e(TAG, "User not authenticated")
                return@withContext Result.failure(Exception("User not authenticated"))
            }

            val request = AIMessageRequest(
                user = User(id = userId, username = username),
                message = userMessage
            )

            Log.d(TAG, "Sending request: $request")

            try {
                val response = RetrofitClient.aiService.askAI(request)
                Log.d(TAG, "Response received: isSuccessful=${response.isSuccessful}, code=${response.code()}")

                if (response.isSuccessful && response.body() != null) {
                    Log.d(TAG, "AI response: ${response.body()}")
                    Result.success(response.body()!!)
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    Log.e(TAG, "Failed to get AI response: ${response.code()}, $errorBody")
                    Result.failure(Exception("Failed to get AI response: ${response.message()} ($errorBody)"))
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception during API call", e)
                Result.failure(e)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in askAI", e)
            Result.failure(e)
        }
    }
}

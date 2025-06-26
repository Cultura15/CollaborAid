package com.example.collaboraid.repository

import android.util.Log
import com.example.collaboraid.api.RetrofitClient
import com.example.collaboraid.model.User
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

class UserRepository(private val sessionManager: SessionManager) {

    private val TAG = "UserRepository"

    suspend fun getCurrentUser(): Result<User> = withContext(Dispatchers.IO) {
        try {
            // Get the auth token from session manager
            val authToken = sessionManager.getAuthToken()
            if (authToken == null) {
                Log.e(TAG, "No auth token available")
                return@withContext Result.failure(Exception("Authentication required"))
            }

            // Create an empty user object to send to the update endpoint
            // This is a workaround - the server will ignore this empty object
            // and return the current user based on the JWT token
            val emptyUser = User(
                username = sessionManager.getUsername() ?: "",
                email = sessionManager.getEmail() ?: "",
                bio = ""
            )

            // Use the update endpoint to get the current user
            val response = RetrofitClient.userService.updateUserDetails(emptyUser, "Bearer $authToken")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Log.e(TAG, "Failed to get current user: ${response.code()} - ${response.errorBody()?.string()}")

                // If the API call fails, create a user object from session data as fallback
                val sessionUser = User(
                    id = sessionManager.getUserId(),
                    username = sessionManager.getUsername() ?: "User",
                    email = sessionManager.getEmail() ?: "",
                    bio = sessionManager.getBio() ?: ""
                )
                Result.success(sessionUser)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception getting current user", e)

            // If there's an exception, create a user object from session data as fallback
            val sessionUser = User(
                id = sessionManager.getUserId(),
                username = sessionManager.getUsername() ?: "User",
                email = sessionManager.getEmail() ?: "",
                bio = sessionManager.getBio() ?: ""
            )
            Result.success(sessionUser)
        }
    }

    suspend fun updateUserDetails(user: User): Result<User> = withContext(Dispatchers.IO) {
        try {
            // Get the auth token from session manager
            val authToken = sessionManager.getAuthToken()
            if (authToken == null) {
                Log.e(TAG, "No auth token available")
                return@withContext Result.failure(Exception("Authentication required"))
            }

            // Include the token in the request
            val response = RetrofitClient.userService.updateUserDetails(user, "Bearer $authToken")
            if (response.isSuccessful && response.body() != null) {
                // Save the updated user data to session manager
                val updatedUser = response.body()!!
                sessionManager.saveUsername(updatedUser.username)
                sessionManager.saveEmail(updatedUser.email)
                sessionManager.saveBio(updatedUser.bio ?: "")

                Result.success(updatedUser)
            } else {
                Log.e(TAG, "Failed to update user: ${response.code()} - ${response.errorBody()?.string()}")
                Result.failure(Exception("Failed to update user: ${response.code()} - ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception updating user", e)
            Result.failure(e)
        }
    }

    suspend fun uploadProfilePicture(profilePicture: File): Result<String> = withContext(Dispatchers.IO) {
        try {
            // Get the auth token from session manager
            val authToken = sessionManager.getAuthToken()
            if (authToken == null) {
                Log.e(TAG, "No auth token available")
                return@withContext Result.failure(Exception("Authentication required"))
            }

            // Log file details for debugging
            Log.d(TAG, "Uploading profile picture: ${profilePicture.absolutePath}")
            Log.d(TAG, "File exists: ${profilePicture.exists()}, File size: ${profilePicture.length()} bytes")

            if (!profilePicture.exists() || profilePicture.length() == 0L) {
                Log.e(TAG, "File does not exist or is empty")
                return@withContext Result.failure(Exception("File does not exist or is empty"))
            }

            // Create file part - IMPORTANT: Use "file" as the part name to match Spring Boot controller
            val requestFile = profilePicture.asRequestBody("image/jpeg".toMediaTypeOrNull())
            Log.d(TAG, "Created RequestBody with MIME type: image/jpeg")

            // IMPORTANT: The part name MUST be "file" to match the @RequestParam("file") in the controller
            val filePart = MultipartBody.Part.createFormData("file", profilePicture.name, requestFile)
            Log.d(TAG, "Created MultipartBody.Part with name: file, filename: ${profilePicture.name}")

            // Log the token (first few characters for security)
            val tokenPreview = authToken.take(10) + "..."
            Log.d(TAG, "Using auth token: $tokenPreview")

            // Include the token in the request
            Log.d(TAG, "Sending request to upload profile picture with auth token")
            val response = RetrofitClient.userService.uploadProfilePicture(filePart, "Bearer $authToken")

            Log.d(TAG, "Upload response code: ${response.code()}")
            if (response.isSuccessful && response.body() != null) {
                val url = response.body()!!
                Log.d(TAG, "Profile picture uploaded successfully. URL: $url")
                Result.success(url)
            } else {
                val errorBody = response.errorBody()?.string() ?: "Unknown error"
                Log.e(TAG, "Failed to upload profile picture: ${response.code()} - $errorBody")

                // Try to get more detailed error information
                if (response.code() == 403) {
                    Log.e(TAG, "403 Forbidden - This is likely an authorization issue")
                    // Try to refresh the token or re-authenticate
                    sessionManager.logStoredValues() // Log all session values for debugging
                }

                Result.failure(Exception("Failed to upload profile picture: ${response.code()} - $errorBody"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception uploading profile picture", e)
            Result.failure(e)
        }
    }

}

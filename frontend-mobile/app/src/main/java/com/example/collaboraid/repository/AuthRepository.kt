package com.example.collaboraid.repository

import android.util.Log
import com.example.collaboraid.api.RetrofitClient
import com.example.collaboraid.model.AuthRequest
import com.example.collaboraid.model.AuthResponse
import com.example.collaboraid.model.GoogleLoginRequest
import com.example.collaboraid.model.User
import com.example.collaboraid.model.UserInfo
import com.example.collaboraid.util.SessionManager
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import retrofit2.HttpException

class AuthRepository(private val sessionManager: SessionManager) {

    private val TAG = "AuthRepository"
    private val authService = RetrofitClient.authService

    suspend fun login(username: String, password: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = authService.login(AuthRequest(username, password))
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                Log.d(TAG, "Login successful, saving token: ${authResponse.token.take(10)}...")
                sessionManager.saveAuthToken(authResponse.token)
                sessionManager.saveUserId(authResponse.user.id)
                sessionManager.saveUsername(authResponse.user.username)

                // Also update the static token in RetrofitClient
                RetrofitClient.SessionManager.setToken(authResponse.token)

                Result.success(authResponse)
            } else {
                Log.e(TAG, "Login failed: ${response.code()} - ${response.message()}")
                Result.failure(Exception("Login failed: ${response.code()} - ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception during login", e)
            Result.failure(e)
        }
    }

    suspend fun googleLogin(account: GoogleSignInAccount): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            // Get account information
            val email = account.email
            val name = account.displayName
            val googleId = account.id

            if (email == null) {
                Log.e(TAG, "Google Sign-In failed: Email is null")
                return@withContext Result.failure(Exception("Missing email from Google account"))
            }

            // Create request body
            val requestBody = HashMap<String, String>().apply {
                put("email", email)
                if (name != null) put("name", name)
                if (googleId != null) put("googleId", googleId)
            }

            // Log the request
            Log.d(TAG, "Making API call to google-login/android-simple with email: $email")

            // Make API call to your simple Android Google login endpoint
            val response = authService.googleLoginAndroidSimple(requestBody)

            if (response.isSuccessful) {
                val googleLoginResponse = response.body()
                if (googleLoginResponse != null) {
                    // Extract token and user info
                    val token = googleLoginResponse.token
                    val userInfo = googleLoginResponse.user

                    // Create auth response with UserInfo
                    val authResponse = AuthResponse(token, userInfo)

                    // Save to session manager
                    sessionManager.saveAuthToken(token)
                    sessionManager.saveUserId(userInfo.id)
                    sessionManager.saveUsername(userInfo.username)
                    sessionManager.saveEmail(email)
                    sessionManager.saveIsGoogleSignIn(true)

                    // Save profile picture URL if available
                    val photoUrl = account.photoUrl?.toString()
                    if (photoUrl != null) {
                        sessionManager.saveProfilePictureUrl(photoUrl)
                    }

                    // Set token for future API calls
                    RetrofitClient.SessionManager.setToken(token)

                    Log.d(TAG, "Google login successful with JWT token")
                    return@withContext Result.success(authResponse)
                }

                Log.e(TAG, "Empty or invalid response body from Google login")
                return@withContext Result.failure(Exception("Invalid response from server"))
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Google login failed with error body: $errorBody")

                val errorMessage = try {
                    JSONObject(errorBody ?: "").getString("error")
                } catch (e: Exception) {
                    "Google login failed: ${response.code()} - ${response.message()}"
                }

                Log.e(TAG, "Google login failed: $errorMessage")
                return@withContext Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception during Google login", e)
            return@withContext Result.failure(e)
        }
    }

    suspend fun register(username: String, email: String, password: String): Result<User> = withContext(Dispatchers.IO) {
        try {
            val user = User(
                username = username,
                email = email,
                password = password
            )
            val response = authService.register(user)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Log.e(TAG, "Registration failed: ${response.code()} - ${response.message()}")
                Result.failure(Exception("Registration failed: ${response.code()} - ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception during registration", e)
            Result.failure(e)
        }
    }

    suspend fun validateToken(): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            Log.d(TAG, "Validating token: ${token.take(10)}...")

            val response = authService.validateToken("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Log.e(TAG, "Token validation failed: ${response.code()} - ${response.message()}")
                Result.failure(Exception("Token validation failed: ${response.code()} - ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception during token validation", e)
            Result.failure(e)
        }
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }

    suspend fun logout() {
        Log.d(TAG, "Logging out")
        sessionManager.clearSession()
    }
}
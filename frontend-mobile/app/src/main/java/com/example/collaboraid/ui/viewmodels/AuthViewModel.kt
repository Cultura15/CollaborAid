package com.example.collaboraid.ui.viewmodels

import android.content.Intent
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.repository.AuthRepository
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.common.api.ApiException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class AuthViewModel(private val authRepository: AuthRepository) : ViewModel() {

    private val TAG = "AuthViewModel"

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun login(username: String, password: String) {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            val result = authRepository.login(username, password)
            result.fold(
                onSuccess = { authResponse ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isLoggedIn = true,
                            userId = authResponse.user.id,
                            username = authResponse.user.username
                        )
                    }
                },
                onFailure = { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Unknown error"
                        )
                    }
                }
            )
        }
    }

    fun register(username: String, email: String, password: String) {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            val result = authRepository.register(username, email, password)
            result.fold(
                onSuccess = { user ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isRegistered = true,
                            // Note: After registration, you might want to automatically log in
                            // or navigate to the login screen
                        )
                    }
                },
                onFailure = { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Unknown error"
                        )
                    }
                }
            )
        }
    }


    private fun googleLogin(account: GoogleSignInAccount) {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            val result = authRepository.googleLogin(account)  // Pass the entire account
            result.fold(
                onSuccess = { authResponse ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isLoggedIn = true,
                            userId = authResponse.user.id,
                            username = authResponse.user.username,
                            isGoogleSignIn = true
                        )
                    }
                },
                onFailure = { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Unknown error"
                        )
                    }
                }
            )
        }
    }

    fun handleGoogleLogin(account: GoogleSignInAccount) {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            Log.d(TAG, "Processing Google login for account: ${account.email}")
            val result = authRepository.googleLogin(account)
            result.fold(
                onSuccess = { authResponse ->
                    Log.d(TAG, "Google login successful, userId: ${authResponse.user.id}, username: ${authResponse.user.username}")

                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isLoggedIn = true,
                            userId = authResponse.user.id,
                            username = authResponse.user.username,
                            isGoogleSignIn = true
                        )
                    }
                },
                onFailure = { exception ->
                    Log.e(TAG, "Google login failed", exception)
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Unknown error"
                        )
                    }
                }
            )
        }
    }

    fun handleGoogleSignInResult(data: Intent?) {
        try {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            val account = task.getResult(ApiException::class.java)
            handleGoogleLogin(account)  // Call the public method
        } catch (e: ApiException) {
            Log.e(TAG, "Google sign in failed", e)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    error = "Google sign in failed: ${e.statusCode}"
                )
            }
        }
    }

    fun checkLoginStatus() {
        val isLoggedIn = authRepository.isLoggedIn()
        if (isLoggedIn) {
            _uiState.update { it.copy(isLoggedIn = true) }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.update {
                AuthUiState()
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    // Add this method to set an error message
    fun setError(errorMessage: String) {
        _uiState.update { it.copy(error = errorMessage) }
    }
}

data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val isRegistered: Boolean = false,
    val userId: Long = 0,
    val username: String = "",
    val error: String? = null,
    val isGoogleSignIn: Boolean = false
)

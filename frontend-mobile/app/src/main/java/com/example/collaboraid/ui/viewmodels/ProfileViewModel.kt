package com.example.collaboraid.ui.viewmodels

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.api.RetrofitClient
import com.example.collaboraid.model.Notification
import com.example.collaboraid.model.Task
import com.example.collaboraid.model.User
import com.example.collaboraid.repository.AuthRepository
import com.example.collaboraid.repository.NotificationRepository
import com.example.collaboraid.repository.TaskRepository
import com.example.collaboraid.repository.UserRepository
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File

class ProfileViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val TAG = "ProfileViewModel"
    private val authRepository = AuthRepository(sessionManager)
    private val taskRepository = TaskRepository(sessionManager)
    private val notificationRepository = NotificationRepository(sessionManager)
    private val userRepository = UserRepository(sessionManager)

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        // Set default values from SessionManager
        _uiState.update {
            it.copy(
                username = sessionManager.getUsername() ?: "User",
                email = sessionManager.getEmail() ?: "",
                bio = sessionManager.getBio() ?: ""
            )
        }
    }

    fun loadUserProfile() {
        _uiState.update { it.copy(isLoading = true) }

        viewModelScope.launch {
            Log.d(TAG, "Loading user profile")

            userRepository.getCurrentUser()
                .onSuccess { user ->
                    Log.d(TAG, "User profile loaded successfully: ${user.username}, ${user.email}, bio=${user.bio}")
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            username = user.username,
                            email = user.email,
                            bio = user.bio ?: "",  // Handle null bio
                            profilePicture = user.profilePicture,
                            error = null
                        )
                    }
                    // Save to session manager for future use
                    sessionManager.saveUsername(user.username)
                    sessionManager.saveEmail(user.email)
                    sessionManager.saveBio(user.bio ?: "")
                    if (user.id != null) {
                        sessionManager.saveUserId(user.id)
                    }
                }
                .onFailure { exception ->
                    Log.e(TAG, "Failed to load user profile", exception)
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to load user profile"
                        )
                    }

                    // Fallback to session manager data
                    _uiState.update {
                        it.copy(
                            username = sessionManager.getUsername() ?: "User",
                            email = sessionManager.getEmail() ?: "",
                            bio = sessionManager.getBio() ?: ""
                        )
                    }
                }
        }
    }

    fun updateUserDetails(user: User, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            userRepository.updateUserDetails(user)
                .onSuccess { updatedUser ->
                    Log.d(TAG, "User updated successfully: ${updatedUser.username}, ${updatedUser.email}, bio=${updatedUser.bio}")
                    _uiState.update {
                        it.copy(
                            username = updatedUser.username,
                            email = updatedUser.email,
                            bio = updatedUser.bio ?: "",
                            profilePicture = updatedUser.profilePicture
                        )
                    }
                    sessionManager.saveUsername(updatedUser.username)
                    sessionManager.saveEmail(updatedUser.email)
                    sessionManager.saveBio(updatedUser.bio ?: "")
                    onSuccess()
                }
                .onFailure { exception ->
                    Log.e(TAG, "Failed to update user details", exception)
                    onError(exception.message ?: "Failed to update user details")
                }
        }
    }

    fun uploadProfilePicture(profilePicture: File, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            userRepository.uploadProfilePicture(profilePicture)
                .onSuccess { profilePictureUrl ->
                    _uiState.update {
                        it.copy(
                            profilePicture = profilePictureUrl
                        )
                    }
                    onSuccess()
                    // Reload user profile to get updated data
                    loadUserProfile()
                }
                .onFailure { exception ->
                    onError(exception.message ?: "Failed to upload profile picture")
                }
        }
    }

    // Rest of the methods remain the same

    fun loadPostedTasks() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.getTasksPostedByUser()
                .onSuccess { tasks ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            postedTasks = tasks,
                            error = null
                        )
                    }
                }
                .onFailure { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to load posted tasks"
                        )
                    }
                }
        }
    }

    fun loadAcceptedTasks() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.getAcceptedTasksByUser()
                .onSuccess { tasks ->
                    // Filter out tasks that are already done
                    val inProgressTasks = tasks.filter { it.status != "Done" }

                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            acceptedTasks = inProgressTasks,
                            error = null
                        )
                    }
                }
                .onFailure { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to load accepted tasks"
                        )
                    }
                }
        }
    }

    fun loadDoneTasks() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            // Load both posted and accepted tasks that are done
            val postedResult = taskRepository.getTasksPostedByUser()
            val acceptedResult = taskRepository.getAcceptedTasksByUser()

            if (postedResult.isSuccess && acceptedResult.isSuccess) {
                val postedDoneTasks = postedResult.getOrDefault(emptyList()).filter { it.status == "Done" }
                val acceptedDoneTasks = acceptedResult.getOrDefault(emptyList()).filter { it.status == "Done" }

                // Combine both lists
                val allDoneTasks = postedDoneTasks + acceptedDoneTasks

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        doneTasks = allDoneTasks,
                        error = null
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to load done tasks"
                    )
                }
            }
        }
    }

    fun loadNotifications() {
        viewModelScope.launch {
            notificationRepository.getAllNotifications()
                .onSuccess { notifications ->
                    _uiState.update {
                        it.copy(
                            notifications = notifications
                        )
                    }
                }
                .onFailure { exception ->
                    // Just log the error, don't update UI state
                    Log.e(TAG, "Failed to load notifications: ${exception.message}")
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.update {
                it.copy(
                    isLoggedOut = true
                )
            }
        }
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }

    fun getCurrentUserId(): Long? {
        return sessionManager.getUserId()
    }

    // Get count of unread notifications
    fun getUnreadNotificationCount(): Int {
        return _uiState.value.notifications.count { !it.isRead }
    }
}

data class ProfileUiState(
    val isLoading: Boolean = false,
    val username: String = "",
    val email: String = "",
    val bio: String = "",
    val profilePicture: String? = null,
    val postedTasks: List<Task> = emptyList(),
    val acceptedTasks: List<Task> = emptyList(),
    val doneTasks: List<Task> = emptyList(),
    val notifications: List<Notification> = emptyList(),
    val isLoggedOut: Boolean = false,
    val error: String? = null
)

class ProfileViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ProfileViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ProfileViewModel(sessionManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

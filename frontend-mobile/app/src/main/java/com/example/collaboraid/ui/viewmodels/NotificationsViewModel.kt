package com.example.collaboraid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.model.Notification
import com.example.collaboraid.repository.NotificationRepository
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class NotificationsUiState(
    val notifications: List<Notification> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class NotificationsViewModel(
    private val sessionManager: SessionManager,
    private val notificationRepository: NotificationRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationsUiState())
    val uiState: StateFlow<NotificationsUiState> = _uiState.asStateFlow()

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }

    fun loadNotifications() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                notificationRepository.getAllNotifications()
                    .onSuccess { notifications ->
                        _uiState.update { it.copy(
                            notifications = notifications,
                            isLoading = false
                        ) }
                    }
                    .onFailure { exception ->
                        _uiState.update { it.copy(
                            error = exception.message ?: "Failed to load notifications",
                            isLoading = false
                        ) }
                    }
            } catch (e: Exception) {
                _uiState.update { it.copy(
                    error = e.message ?: "Failed to load notifications",
                    isLoading = false
                ) }
            }
        }
    }

    fun markNotificationAsRead(notificationId: Long) {
        viewModelScope.launch {
            try {
                notificationRepository.markAsRead(notificationId)
                    .onSuccess {
                        // Update the local state to mark the notification as read
                        _uiState.update { currentState ->
                            val updatedNotifications = currentState.notifications.map { notification ->
                                if (notification.id == notificationId) {
                                    notification.copy(isRead = true)
                                } else {
                                    notification
                                }
                            }
                            currentState.copy(notifications = updatedNotifications)
                        }
                    }
            } catch (e: Exception) {
                // Handle error if needed
            }
        }
    }

    fun deleteNotification(notificationId: Long) {
        viewModelScope.launch {
            try {
                notificationRepository.deleteNotification(notificationId)
                    .onSuccess {
                        // Remove the notification from the local state
                        _uiState.update { currentState ->
                            val updatedNotifications = currentState.notifications.filter {
                                it.id != notificationId
                            }
                            currentState.copy(notifications = updatedNotifications)
                        }
                    }
            } catch (e: Exception) {
                // Handle error if needed
            }
        }
    }

    fun clearAllNotifications() {
        viewModelScope.launch {
            try {
                notificationRepository.clearAllNotifications()
                    .onSuccess {
                        // Clear notifications from local state
                        _uiState.update { it.copy(notifications = emptyList()) }
                    }
                    .onFailure { exception ->
                        _uiState.update { it.copy(
                            error = exception.message ?: "Failed to clear notifications"
                        ) }
                    }
            } catch (e: Exception) {
                _uiState.update { it.copy(
                    error = e.message ?: "Failed to clear notifications"
                ) }
            }
        }
    }

    fun markAllAsRead() {
        viewModelScope.launch {
            try {
                notificationRepository.markAllAsRead()
                    .onSuccess {
                        _uiState.update { currentState ->
                            val updatedNotifications = currentState.notifications.map { notification ->
                                notification.copy(isRead = true)
                            }
                            currentState.copy(notifications = updatedNotifications)
                        }
                    }
            } catch (e: Exception) {
                // Handle error if needed
            }
        }
    }

    // Get count of unread notifications
    fun getUnreadNotificationCount(): Int {
        return _uiState.value.notifications.count { !it.isRead }
    }
}

class NotificationsViewModelFactory(
    private val sessionManager: SessionManager
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(NotificationsViewModel::class.java)) {
            return NotificationsViewModel(
                sessionManager,
                NotificationRepository(sessionManager)
            ) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

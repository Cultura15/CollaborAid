package com.example.collaboraid.ui.viewmodels

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.model.Notification
import com.example.collaboraid.model.Task
import com.example.collaboraid.repository.NotificationRepository
import com.example.collaboraid.repository.TaskRepository
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class FeedViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val TAG = "FeedViewModel"
    private val taskRepository = TaskRepository(sessionManager)
    private val notificationRepository = NotificationRepository(sessionManager)

    private val _uiState = MutableStateFlow(FeedUiState())
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    // Store all tasks to enable filtering
    private var allTasks: List<Task> = emptyList()

    fun loadTasks() {
        loadOpenTasks()
    }

    fun loadOpenTasks() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.getOpenTasks()
                .onSuccess { tasks ->
                    allTasks = tasks
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            tasks = tasks,
                            error = null
                        )
                    }
                }
                .onFailure { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to load tasks"
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

    fun loadInProgressTasks() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.getInProgressTasks()
                .onSuccess { tasks ->
                    allTasks = tasks
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            tasks = tasks,
                            error = null
                        )
                    }
                }
                .onFailure { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to load tasks"
                        )
                    }
                }
        }
    }

    fun loadDoneTasks() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.getDoneTasks()
                .onSuccess { tasks ->
                    allTasks = tasks
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            tasks = tasks,
                            error = null
                        )
                    }
                }
                .onFailure { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to load tasks"
                        )
                    }
                }
        }
    }

    fun acceptTask(taskId: Long) {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.acceptTask(taskId)
                .onSuccess { task ->
                    loadOpenTasks()
                }
                .onFailure { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to accept task"
                        )
                    }
                }
        }
    }

    fun filterTasksByCategory(category: String) {
        if (category == "For You") {
            // Reset to show all tasks
            _uiState.update { it.copy(tasks = allTasks) }
        } else {
            // Filter tasks by category
            val filteredTasks = allTasks.filter { task ->
                task.category.equals(category, ignoreCase = true) ||
                        task.category.replace("_", " ").equals(category, ignoreCase = true)
            }
            _uiState.update { it.copy(tasks = filteredTasks) }
        }
    }

    fun searchTasks(query: String) {
        if (query.isBlank()) {
            // Reset to show all tasks
            _uiState.update { it.copy(tasks = allTasks) }
        } else {
            // Filter tasks by search query
            val filteredTasks = allTasks.filter { task ->
                task.title.contains(query, ignoreCase = true) ||
                        task.description.contains(query, ignoreCase = true) ||
                        task.user?.username?.contains(query, ignoreCase = true) == true ||
                        task.category.contains(query, ignoreCase = true)
            }
            _uiState.update { it.copy(tasks = filteredTasks) }
        }
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }
}

data class FeedUiState(
    val isLoading: Boolean = false,
    val tasks: List<Task> = emptyList(),
    val error: String? = null,
    val notifications: List<Notification> = emptyList()
)

class FeedViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(FeedViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return FeedViewModel(sessionManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

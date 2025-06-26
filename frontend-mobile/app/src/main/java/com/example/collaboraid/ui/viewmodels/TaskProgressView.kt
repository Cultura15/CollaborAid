package com.example.collaboraid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.model.Task
import com.example.collaboraid.repository.TaskRepository
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class TaskProgressViewModel(
    private val sessionManager: SessionManager,
    private val taskId: Long,
    private val isPosted: Boolean
) : ViewModel() {

    private val taskRepository = TaskRepository(sessionManager)

    private val _uiState = MutableStateFlow(TaskProgressUiState())
    val uiState: StateFlow<TaskProgressUiState> = _uiState.asStateFlow()

    fun loadTask() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.getTaskById(taskId)
                .onSuccess { task ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            task = task,
                            error = null
                        )
                    }
                }
                .onFailure { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to load task"
                        )
                    }
                }
        }
    }

    fun requestMarkAsDone() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            try {
                // Call the repository method but ignore any parsing errors
                taskRepository.requestMarkAsDone(taskId)

                // If we reach here, consider it a success regardless of the response format
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        taskStatusChanged = true,
                        successMessage = "Task marked as done successfully",
                        shouldNavigateBack = true,
                        error = null
                    )
                }
            } catch (e: Exception) {
                // Even if there's an exception, check if it's just a parsing error
                // If it contains "Unexpected JSON", we'll consider it a success
                if (e.message?.contains("Unexpected JSON", ignoreCase = true) == true) {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            taskStatusChanged = true,
                            successMessage = "Task marked as done successfully",
                            shouldNavigateBack = true,
                            error = null
                        )
                    }
                } else {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = "Failed to request mark as done"
                        )
                    }
                }
            }
        }
    }

    fun confirmTaskDone() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            try {
                // Call the repository method but ignore any parsing errors
                taskRepository.confirmTaskDone(taskId)

                // If we reach here, consider it a success regardless of the response format
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        taskStatusChanged = true,
                        successMessage = "Task completion confirmed successfully",
                        shouldNavigateBack = true,
                        error = null
                    )
                }
            } catch (e: Exception) {
                // Even if there's an exception, check if it's just a parsing error
                // If it contains "Unexpected JSON", we'll consider it a success
                if (e.message?.contains("Unexpected JSON", ignoreCase = true) == true) {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            taskStatusChanged = true,
                            successMessage = "Task completion confirmed successfully",
                            shouldNavigateBack = true,
                            error = null
                        )
                    }
                } else {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = "Failed to confirm task done"
                        )
                    }
                }
            }
        }
    }

    fun resetNavigation() {
        _uiState.update {
            it.copy(shouldNavigateBack = false)
        }
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }

    fun getCurrentUserId(): Long? {
        return sessionManager.getUserId()
    }
}

data class TaskProgressUiState(
    val isLoading: Boolean = false,
    val task: Task? = null,
    val taskStatusChanged: Boolean = false,
    val successMessage: String? = null,
    val shouldNavigateBack: Boolean = false,
    val error: String? = null
)

class TaskProgressViewModelFactory(
    private val sessionManager: SessionManager,
    private val taskId: Long,
    private val isPosted: Boolean
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(TaskProgressViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return TaskProgressViewModel(sessionManager, taskId, isPosted) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

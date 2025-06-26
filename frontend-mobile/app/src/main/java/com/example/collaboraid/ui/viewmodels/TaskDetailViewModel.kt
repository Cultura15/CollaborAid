package com.example.collaboraid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.model.Task
import com.example.collaboraid.repository.TaskRepository
import com.example.collaboraid.ui.screens.task.Comment
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class TaskDetailViewModel(
    private val sessionManager: SessionManager,
    private val taskId: Long
) : ViewModel() {

    private val taskRepository = TaskRepository(sessionManager)

    private val _uiState = MutableStateFlow(TaskDetailUiState())
    val uiState: StateFlow<TaskDetailUiState> = _uiState.asStateFlow()

    fun loadTask() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.getTaskById(taskId)
                .onSuccess { task ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            task = task,
                            error = null,
                            comments = getSampleComments() // In a real app, fetch comments from API
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

    fun acceptTask() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            taskRepository.acceptTask(taskId)
                .onSuccess { task ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            task = task,
                            isAccepted = true,
                            error = null
                        )
                    }
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

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }

    private fun getSampleComments(): List<Comment> {
        return listOf(
            Comment(
                username = "Jane Smith",
                timeAgo = "1h ago",
                text = "I can help with this! I've done similar tasks before.",
                upvotes = 3
            ),
            Comment(
                username = "Alex Johnson",
                timeAgo = "45m ago",
                text = "When do you need this completed by?",
                upvotes = 1
            )
        )
    }
}

data class TaskDetailUiState(
    val isLoading: Boolean = false,
    val task: Task? = null,
    val comments: List<Comment> = emptyList(),
    val isAccepted: Boolean = false,
    val error: String? = null
)

class TaskDetailViewModelFactory(
    private val sessionManager: SessionManager,
    private val taskId: Long
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(TaskDetailViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return TaskDetailViewModel(sessionManager, taskId) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

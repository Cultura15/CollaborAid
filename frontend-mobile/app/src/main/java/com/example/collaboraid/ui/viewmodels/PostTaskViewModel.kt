package com.example.collaboraid.ui.viewmodels

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.model.FormattedTextSegment
import com.example.collaboraid.repository.TaskRepository
import com.example.collaboraid.util.RichTextUtil
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class PostTaskViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val taskRepository = TaskRepository(sessionManager)

    private val _uiState = MutableStateFlow(PostTaskUiState())
    val uiState: StateFlow<PostTaskUiState> = _uiState.asStateFlow()

    fun createTask(
        title: String,
        description: String,
        category: String,
        titleSegments: List<FormattedTextSegment>,
        descriptionSegments: List<FormattedTextSegment>,
        imageUri: Uri? = null,
        context: Context? = null
    ) {
        if (title.isBlank() || category.isBlank()) {
            _uiState.update {
                it.copy(
                    error = "Title and category are required"
                )
            }
            return
        }

        _uiState.update { it.copy(isLoading = true, error = null) }

        // Handle image (temporary solution)
        var savedImageUri: String? = null
        if (imageUri != null && context != null) {
            try {
                // Save image to internal storage (temporary solution)
                savedImageUri = RichTextUtil.saveImageToInternalStorage(imageUri, context)
                Log.d("PostTaskViewModel", "Image saved to: $savedImageUri")
            } catch (e: Exception) {
                Log.e("PostTaskViewModel", "Error saving image", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to save image: ${e.message}"
                    )
                }
                return
            }
        }

        viewModelScope.launch {
            // For now, we'll just pass the basic task info to the backend
            // and handle the formatted text and image locally
            taskRepository.createTask(title, description, category)
                .onSuccess { task ->
                    // In a real implementation, you would send the formatted text and image to the backend
                    // For now, we'll just update the UI state
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isTaskCreated = true,
                            error = null,
                            titleSegments = titleSegments,
                            descriptionSegments = descriptionSegments,
                            imageUri = savedImageUri
                        )
                    }

                    // Store the formatted text and image URI in shared preferences for demo purposes
                    if (task.id != null && context != null) {
                        RichTextUtil.saveFormattedTextSegments(task.id, titleSegments, descriptionSegments, context)
                        storeImageUri(task.id, savedImageUri)
                    }
                }
                .onFailure { exception ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = exception.message ?: "Failed to create task"
                        )
                    }
                }
        }
    }

    private fun storeImageUri(taskId: Long, imageUri: String?) {
        // In a real app, you would store this in a database or send it to the backend
        // For this demo, we'll use shared preferences
        val prefs = sessionManager.getContext().getSharedPreferences("task_formatting", Context.MODE_PRIVATE)
        val editor = prefs.edit()

        editor.putString("task_${taskId}_image", imageUri)
        editor.apply()
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }
}

data class PostTaskUiState(
    val isLoading: Boolean = false,
    val isTaskCreated: Boolean = false,
    val error: String? = null,
    val titleSegments: List<FormattedTextSegment> = emptyList(),
    val descriptionSegments: List<FormattedTextSegment> = emptyList(),
    val imageUri: String? = null
)

class PostTaskViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(PostTaskViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return PostTaskViewModel(sessionManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

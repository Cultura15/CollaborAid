package com.example.collaboraid.util

import android.content.Context
import android.net.Uri
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import com.example.collaboraid.model.FormattedTextSegment
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

/**
 * Utility class for handling rich text formatting and image storage
 */
object RichTextUtil {

    private val gson = Gson()

    /**
     * Save image to internal storage
     */
    fun saveImageToInternalStorage(uri: Uri, context: Context): String {
        val inputStream = context.contentResolver.openInputStream(uri)
        val fileName = "task_image_${UUID.randomUUID()}.jpg"
        val outputFile = File(context.filesDir, fileName)

        inputStream?.use { input ->
            FileOutputStream(outputFile).use { output ->
                input.copyTo(output)
            }
        }

        return outputFile.absolutePath
    }

    /**
     * Save formatted text segments to shared preferences
     */
    fun saveFormattedTextSegments(
        taskId: Long,
        titleSegments: List<FormattedTextSegment>,
        descriptionSegments: List<FormattedTextSegment>,
        context: Context
    ) {
        val prefs = context.getSharedPreferences("task_formatting", Context.MODE_PRIVATE)
        val editor = prefs.edit()

        // Convert segments to JSON
        val titleJson = gson.toJson(titleSegments)
        val descriptionJson = gson.toJson(descriptionSegments)

        // Store in shared preferences
        editor.putString("task_${taskId}_title_segments", titleJson)
        editor.putString("task_${taskId}_description_segments", descriptionJson)
        editor.apply()
    }

    /**
     * Load formatted text segments from shared preferences
     */
    fun loadFormattedTextSegments(
        taskId: Long,
        context: Context
    ): Pair<List<FormattedTextSegment>, List<FormattedTextSegment>> {
        val prefs = context.getSharedPreferences("task_formatting", Context.MODE_PRIVATE)

        // Get JSON strings
        val titleJson = prefs.getString("task_${taskId}_title_segments", null)
        val descriptionJson = prefs.getString("task_${taskId}_description_segments", null)

        // Parse JSON to segment lists
        val titleSegments = if (titleJson != null) {
            val type = object : TypeToken<List<FormattedTextSegment>>() {}.type
            gson.fromJson<List<FormattedTextSegment>>(titleJson, type)
        } else {
            emptyList()
        }

        val descriptionSegments = if (descriptionJson != null) {
            val type = object : TypeToken<List<FormattedTextSegment>>() {}.type
            gson.fromJson<List<FormattedTextSegment>>(descriptionJson, type)
        } else {
            emptyList()
        }

        return Pair(titleSegments, descriptionSegments)
    }

    /**
     * Get image URI for a task from shared preferences
     */
    fun getImageForTask(taskId: Long, context: Context): Uri? {
        val prefs = context.getSharedPreferences("task_formatting", Context.MODE_PRIVATE)
        val imagePath = prefs.getString("task_${taskId}_image", null) ?: return null

        val file = File(imagePath)
        if (!file.exists()) return null

        return Uri.fromFile(file)
    }

    /**
     * Convert alignment index to TextAlign
     */
    fun getTextAlignFromIndex(index: Int): TextAlign {
        return when (index) {
            0 -> TextAlign.Start
            1 -> TextAlign.Center
            2 -> TextAlign.End
            3 -> TextAlign.Justify
            else -> TextAlign.Start
        }
    }

    /**
     * Build an AnnotatedString from a list of formatted text segments
     */
    fun buildAnnotatedString(segments: List<FormattedTextSegment>): AnnotatedString {
        return buildAnnotatedString {
            for (segment in segments) {
                withStyle(
                    SpanStyle(
                        fontWeight = if (segment.isBold) FontWeight.Bold else null,
                        fontStyle = if (segment.isItalic) FontStyle.Italic else null,
                        textDecoration = if (segment.isUnderlined) TextDecoration.Underline else null
                    )
                ) {
                    append(segment.text)
                }
            }
        }
    }
}

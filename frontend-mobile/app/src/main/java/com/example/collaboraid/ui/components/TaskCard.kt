package com.example.collaboraid.ui.components

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.KeyboardArrowUp
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.collaboraid.model.FormattedTextSegment
import com.example.collaboraid.model.Task
import com.example.collaboraid.util.RichTextUtil

@Composable
fun TaskCard(
    task: Task,
    onTaskClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    // Load formatted text segments and image
    val (titleSegments, descriptionSegments) = if (task.id != null) {
        RichTextUtil.loadFormattedTextSegments(task.id, context)
    } else {
        Pair(emptyList(), emptyList())
    }

    val imageUri = if (task.id != null) {
        RichTextUtil.getImageForTask(task.id, context)
    } else {
        null
    }

    // Get category color based on task category
    val (backgroundColor, textColor) = getCategoryColor(task.category)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onTaskClick() }
            .padding(16.dp)
    ) {
        // User info row
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Profile picture
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color.DarkGray),
                contentAlignment = Alignment.Center
            ) {
                task.user?.let { user ->
                    // Use profile picture if available, otherwise use avatar
                    if (user.profilePicture != null) {
                        AsyncImage(
                            model = user.profilePicture,
                            contentDescription = "Profile picture",
                            modifier = Modifier.size(40.dp),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        AsyncImage(
                            model = "https://ui-avatars.com/api/?name=${user.username}&background=random",
                            contentDescription = "Profile picture",
                            modifier = Modifier.size(40.dp),
                            contentScale = ContentScale.Crop
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Username and timestamp
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = task.user?.username ?: "Unknown User",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White
                )
                Text(
                    text = "@${task.user?.username?.lowercase()?.replace(" ", "") ?: "unknown"} · 2h ago",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }

            // Status chip
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF1DA1F2))
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Text(
                    text = task.status,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Task title with formatting
        if (titleSegments.isNotEmpty()) {
            Text(
                text = buildFormattedText(task.title, titleSegments),
                style = MaterialTheme.typography.titleMedium,
                color = Color.White
            )
        } else {
            Text(
                text = task.title,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White
            )
        }

        // Task description with formatting
        if (descriptionSegments.isNotEmpty()) {
            Text(
                text = buildFormattedText(task.description, descriptionSegments),
                style = MaterialTheme.typography.bodyMedium,
                color = Color.LightGray,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        } else {
            Text(
                text = task.description,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.LightGray,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Display image if available
        imageUri?.let { uri ->
            Spacer(modifier = Modifier.height(8.dp))
            AsyncImage(
                model = uri,
                contentDescription = "Task Image",
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp)
                    .clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Category chip with dynamic color
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(16.dp))
                .background(backgroundColor)
                .padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
            Text(
                text = formatCategoryName(task.category),
                style = MaterialTheme.typography.bodySmall,
                color = textColor
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Action buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Upvote
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { /* Upvote */ }
            ) {
                Icon(
                    imageVector = Icons.Outlined.KeyboardArrowUp,
                    contentDescription = "Upvote",
                    tint = Color.Gray,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "0",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }

            // Comment
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { /* Comment */ }
            ) {
                Icon(
                    imageVector = Icons.Outlined.ChatBubbleOutline,
                    contentDescription = "Comment",
                    tint = Color.Gray,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "0",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }

            // Share
            Icon(
                imageVector = Icons.Outlined.Share,
                contentDescription = "Share",
                tint = Color.Gray,
                modifier = Modifier
                    .size(20.dp)
                    .clickable { /* Share */ }
            )

            // Save
            Icon(
                imageVector = Icons.Outlined.BookmarkBorder,
                contentDescription = "Save",
                tint = Color.Gray,
                modifier = Modifier
                    .size(20.dp)
                    .clickable { /* Save */ }
            )
        }
    }
}

// Helper function to build formatted text
private fun buildFormattedText(text: String, segments: List<FormattedTextSegment>): AnnotatedString {
    return buildAnnotatedString {
        var lastIndex = 0

        // Sort segments by their position in the text
        val sortedSegments = segments.sortedBy { text.indexOf(it.text) }

        for (segment in sortedSegments) {
            val startIndex = text.indexOf(segment.text, lastIndex)
            if (startIndex == -1) continue // Skip if segment not found

            // Add unstyled text before this segment
            if (startIndex > lastIndex) {
                append(text.substring(lastIndex, startIndex))
            }

            // Add styled segment
            withStyle(
                SpanStyle(
                    fontWeight = if (segment.isBold) FontWeight.Bold else null,
                    fontStyle = if (segment.isItalic) FontStyle.Italic else null,
                    textDecoration = if (segment.isUnderlined) TextDecoration.Underline else null
                )
            ) {
                append(segment.text)
            }

            lastIndex = startIndex + segment.text.length
        }

        // Add any remaining unstyled text
        if (lastIndex < text.length) {
            append(text.substring(lastIndex))
        }
    }
}

// Helper function to format category name for display
private fun formatCategoryName(category: String): String {
    return category.replace("_", " ").split(" ").joinToString(" ") {
        it.lowercase().replaceFirstChar { char -> char.uppercase() }
    }
}

// Helper function to get color for category
private fun getCategoryColor(category: String): Pair<Color, Color> {
    return when (category.uppercase()) {
        "ENGINEERING" -> Pair(Color(0xFF1A237E), Color.White)
        "NURSING" -> Pair(Color(0xFFE1F5FE), Color(0xFF01579B))
        "PROGRAMMING" -> Pair(Color(0xFF263238), Color(0xFF4DB6AC))
        "MATHEMATICS" -> Pair(Color(0xFFE8F5E9), Color(0xFF2E7D32))
        "PHYSICS" -> Pair(Color(0xFF311B92), Color.White)
        "CHEMISTRY" -> Pair(Color(0xFFEFEBE9), Color(0xFF4E342E))
        "BIOLOGY" -> Pair(Color(0xFF004D40), Color.White)
        "PSYCHOLOGY" -> Pair(Color(0xFFFCE4EC), Color(0xFFC2185B))
        "ART_DESIGN" -> Pair(Color(0xFF880E4F), Color.White)
        "MUSIC" -> Pair(Color(0xFF3E2723), Color(0xFFFFCC80))
        "LITERATURE" -> Pair(Color(0xFFFFF3E0), Color(0xFFE65100))
        "HISTORY" -> Pair(Color(0xFF4A148C), Color(0xFFCE93D8))
        "SOCIOLOGY" -> Pair(Color(0xFFEDE7F6), Color(0xFF4527A0))
        "PHILOSOPHY" -> Pair(Color(0xFF37474F), Color(0xFFB0BEC5))
        "EDUCATION" -> Pair(Color(0xFFE0F7FA), Color(0xFF006064))
        "MARKETING" -> Pair(Color(0xFFBF360C), Color.White)
        "BUSINESS_MANAGEMENT" -> Pair(Color(0xFF01579B), Color.White)
        "FINANCE" -> Pair(Color(0xFF004D40), Color(0xFF80CBC4))
        "LEGAL_STUDIES" -> Pair(Color(0xFF263238), Color(0xFF90A4AE))
        "LANGUAGES" -> Pair(Color(0xFFFFF8E1), Color(0xFFF57F17))
        "HEALTH_WELLNESS" -> Pair(Color(0xFFE8F5E9), Color(0xFF1B5E20))
        "DATA_SCIENCE" -> Pair(Color(0xFF0D47A1), Color.White)
        "MACHINE_LEARNING" -> Pair(Color(0xFF1A237E), Color(0xFF8C9EFF))
        else -> Pair(Color(0xFF5C1E0A), Color(0xFFFF5722)) // Default
    }
}

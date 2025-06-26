package com.example.collaboraid.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Comment
import androidx.compose.material.icons.outlined.KeyboardArrowUp
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.collaboraid.model.Task

@Composable
fun ProfileTaskItem(
    task: Task,
    tabType: String,
    onTaskClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF121212))
            .clickable(onClick = onTaskClick)
            .padding(16.dp)
    ) {
        Column {
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
                    val user = when (tabType) {
                        "posted" -> task.acceptedBy
                        "accepted", "done" -> task.user
                        else -> null
                    }

                    // Use profile picture if available, otherwise use avatar
                    if (user?.profilePicture != null) {
                        AsyncImage(
                            model = user.profilePicture,
                            contentDescription = "Profile picture",
                            modifier = Modifier.size(40.dp),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        AsyncImage(
                            model = "https://ui-avatars.com/api/?name=${user?.username ?: "User"}&background=random",
                            contentDescription = "Profile picture",
                            modifier = Modifier.size(40.dp),
                            contentScale = ContentScale.Crop
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Username and timestamp
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = when (tabType) {
                            "posted" -> task.acceptedBy?.username ?: "Not accepted yet"
                            "accepted", "done" -> task.user?.username ?: "Unknown"
                            else -> "Unknown"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White
                    )
                    Text(
                        text = when (tabType) {
                            "posted" -> "You posted · 1d ago"
                            "accepted" -> "You accepted · 1d ago"
                            "done" -> "Completed · 1d ago"
                            else -> "1d ago"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }

                // Status chip
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(
                            when (task.status) {
                                "Open" -> Color(0xFF4CAF50).copy(alpha = 0.2f)
                                "In Progress" -> Color(0xFFFFC107).copy(alpha = 0.2f)
                                "Pending Verification" -> Color(0xFFFF9800).copy(alpha = 0.2f)
                                "Done" -> Color(0xFF2196F3).copy(alpha = 0.2f)
                                else -> Color(0xFF2196F3).copy(alpha = 0.2f)
                            }
                        )
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = task.status,
                        style = MaterialTheme.typography.labelMedium,
                        color = when (task.status) {
                            "Open" -> Color(0xFF4CAF50)
                            "In Progress" -> Color(0xFFFFC107)
                            "Pending Verification" -> Color(0xFFFF9800)
                            "Done" -> Color(0xFF2196F3)
                            else -> Color(0xFF2196F3)
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Task title
            Text(
                text = task.title,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )

            // Task description
            Text(
                text = task.description,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.LightGray,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Category and stats
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Category chip
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF333333))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = task.category,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                // Upvotes
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Outlined.KeyboardArrowUp,
                        contentDescription = "Upvotes",
                        tint = Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "15",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Comments
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Comment,
                        contentDescription = "Comments",
                        tint = Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "7",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Share
                Icon(
                    imageVector = Icons.Outlined.Share,
                    contentDescription = "Share",
                    tint = Color.Gray,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}

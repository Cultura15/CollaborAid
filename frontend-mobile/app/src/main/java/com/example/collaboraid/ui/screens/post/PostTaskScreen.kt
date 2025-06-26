package com.example.collaboraid.ui.screens.post

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.collaboraid.model.FormattedTextSegment
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.PostTaskViewModel
import com.example.collaboraid.ui.viewmodels.PostTaskViewModelFactory
import com.example.collaboraid.util.RichTextUtil
import com.example.collaboraid.util.SessionManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PostTaskScreen(
    navController: NavController,
    viewModel: PostTaskViewModel = viewModel(
        factory = PostTaskViewModelFactory(SessionManager(LocalContext.current))
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var expanded by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    val scrollState = rememberScrollState()
    val context = LocalContext.current

    // Define categories
    val categories = listOf(
        "ENGINEERING",
        "NURSING",
        "PROGRAMMING",
        "MATHEMATICS",
        "PHYSICS",
        "CHEMISTRY",
        "BIOLOGY",
        "PSYCHOLOGY",
        "ART_DESIGN",
        "MUSIC",
        "LITERATURE",
        "HISTORY",
        "SOCIOLOGY",
        "PHILOSOPHY",
        "EDUCATION",
        "MARKETING",
        "BUSINESS_MANAGEMENT",
        "FINANCE",
        "LEGAL_STUDIES",
        "LANGUAGES",
        "HEALTH_WELLNESS",
        "DATA_SCIENCE",
        "MACHINE_LEARNING"
    )

    // Format category for display
    fun formatCategory(cat: String): String {
        return cat.replace("_", " ").split(" ").joinToString(" ") {
            it.lowercase().replaceFirstChar { char -> char.uppercase() }
        }
    }

    // Filtered categories based on search query
    val filteredCategories = remember(searchQuery) {
        if (searchQuery.isEmpty()) {
            categories
        } else {
            categories.filter {
                formatCategory(it).contains(searchQuery, ignoreCase = true)
            }
        }
    }

    // Text formatting states
    var isBold by remember { mutableStateOf(false) }
    var isItalic by remember { mutableStateOf(false) }
    var isUnderline by remember { mutableStateOf(false) }
    var textAlignmentIndex by remember { mutableStateOf(0) } // 0: Left, 1: Center, 2: Right, 3: Justify
    var textAlignment by remember { mutableStateOf(TextAlign.Start) }

    // Selection states
    var titleSelection by remember { mutableStateOf<IntRange?>(null) }
    var descriptionSelection by remember { mutableStateOf<IntRange?>(null) }
    var activeField by remember { mutableStateOf("title") } // "title" or "description"

    // Track formatted segments
    val titleSegments = remember { mutableStateListOf<FormattedTextSegment>() }
    val descriptionSegments = remember { mutableStateListOf<FormattedTextSegment>() }

    // Image attachment state
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    var showFormatMenu by remember { mutableStateOf(false) }

    // Image picker launcher
    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        imageUri = uri
    }

    // Check if user is logged in
    LaunchedEffect(Unit) {
        if (!viewModel.isLoggedIn()) {
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.PostTask.route) { inclusive = true }
            }
        }
    }

    // Handle task creation result
    LaunchedEffect(uiState.isTaskCreated) {
        if (uiState.isTaskCreated) {
            navController.navigate(Screen.Feed.route) {
                popUpTo(Screen.PostTask.route) { inclusive = true }
            }
        }
    }

    // Update text alignment when index changes
    LaunchedEffect(textAlignmentIndex) {
        textAlignment = when (textAlignmentIndex) {
            0 -> TextAlign.Start
            1 -> TextAlign.Center
            2 -> TextAlign.End
            3 -> TextAlign.Justify
            else -> TextAlign.Start
        }
    }

    // Function to apply formatting to selected text
    fun applyFormatting() {
        val selection = if (activeField == "title") titleSelection else descriptionSelection
        val text = if (activeField == "title") title else description
        val segments = if (activeField == "title") titleSegments else descriptionSegments

        if (selection == null || selection.isEmpty()) return

        val selectedText = text.substring(selection.first, selection.last + 1)
        if (selectedText.isBlank()) return

        // Add a new formatted segment
        segments.add(
            FormattedTextSegment(
                text = selectedText,
                isBold = isBold,
                isItalic = isItalic,
                isUnderlined = isUnderline,
                alignment = textAlignmentIndex
            )
        )

        // Clear selection after applying formatting
        if (activeField == "title") {
            titleSelection = null
        } else {
            descriptionSelection = null
        }
    }

    // Function to build annotated string from segments
    fun buildFormattedText(text: String, segments: List<FormattedTextSegment>): AnnotatedString {
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

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF121212))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(scrollState)
        ) {
            // Top bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { navController.popBackStack() }
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color.White
                    )
                }

                Text(
                    text = "Post",
                    color = Color.White,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }

            // Category selector - Reddit style
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF1E1E1E))
                    .clickable { expanded = true }
                    .padding(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // r/ icon
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "r/",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = if (category.isEmpty()) "Select a category" else formatCategory(category),
                        color = if (category.isEmpty()) Color.Gray else Color.White
                    )

                    Spacer(modifier = Modifier.weight(1f))

                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Expand",
                        tint = Color.White
                    )
                }

                // Fixed DropdownMenu implementation
                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier
                        .background(Color(0xFF1E1E1E))
                        .width(300.dp)
                ) {
                    // Search field
                    TextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search categories", color = Color.Gray) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        colors = TextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            cursorColor = Color.White,
                            focusedContainerColor = Color(0xFF2A2A2A),
                            unfocusedContainerColor = Color(0xFF2A2A2A),
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Search",
                                tint = Color.Gray
                            )
                        },
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )

                    Divider(color = Color(0xFF2A2A2A))

                    // Fixed height box with scrollable content
                    Box(
                        modifier = Modifier
                            .height(250.dp) // Fixed height
                    ) {
                        Column(
                            modifier = Modifier
                                .verticalScroll(rememberScrollState())
                        ) {
                            filteredCategories.forEach { item ->
                                DropdownMenuItem(
                                    text = { Text(text = formatCategory(item), color = Color.White) },
                                    onClick = {
                                        category = item
                                        expanded = false
                                        searchQuery = ""
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                        }
                    }
                }
            }

            // Title field with formatting
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Text(
                    text = "Title",
                    color = Color.Gray,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                SelectionContainer {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF1E1E1E), RoundedCornerShape(8.dp))
                            .padding(12.dp)
                            .clickable { activeField = "title" }
                    ) {
                        TextField(
                            value = title,
                            onValueChange = { title = it },
                            onTextSelection = { start, end ->
                                titleSelection = start..end
                                activeField = "title"
                            },
                            placeholder = { Text("Title", color = Color.Gray) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                cursorColor = Color.White,
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            textStyle = TextStyle(
                                fontSize = 18.sp,
                                textAlign = textAlignment
                            ),
                            singleLine = true
                        )

                        // Display formatted text if there are segments
                        if (titleSegments.isNotEmpty()) {
                            Text(
                                text = buildFormattedText(title, titleSegments),
                                color = Color.White,
                                fontSize = 18.sp,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }

            // Description field with formatting
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Text(
                    text = "Description",
                    color = Color.Gray,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                SelectionContainer {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .background(Color(0xFF1E1E1E), RoundedCornerShape(8.dp))
                            .padding(12.dp)
                            .clickable { activeField = "description" }
                    ) {
                        TextField(
                            value = description,
                            onValueChange = { description = it },
                            onTextSelection = { start, end ->
                                descriptionSelection = start..end
                                activeField = "description"
                            },
                            placeholder = { Text("Description (optional)", color = Color.Gray) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .fillMaxHeight(),
                            colors = TextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                cursorColor = Color.White,
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            textStyle = TextStyle(
                                fontSize = 16.sp,
                                textAlign = textAlignment
                            )
                        )

                        // Display formatted text if there are segments
                        if (descriptionSegments.isNotEmpty()) {
                            Text(
                                text = buildFormattedText(description, descriptionSegments),
                                color = Color.White,
                                fontSize = 16.sp,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }

            // Image preview if selected
            imageUri?.let { uri ->
                Spacer(modifier = Modifier.height(16.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF1E1E1E))
                ) {
                    AsyncImage(
                        model = uri,
                        contentDescription = "Attached Image",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Fit
                    )

                    // Remove image button
                    IconButton(
                        onClick = { imageUri = null },
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(8.dp)
                            .size(32.dp)
                            .background(Color(0x80000000), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Remove Image",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            // Error message
            if (uiState.error != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = uiState.error ?: "",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            // Formatting toolbar
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF1E1E1E)
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column {
                    // Text formatting options
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        // Bold button
                        IconButton(
                            onClick = {
                                isBold = !isBold
                                applyFormatting()
                            },
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    if (isBold) Color(0xFF3A3A3A) else Color.Transparent,
                                    CircleShape
                                )
                        ) {
                            Icon(
                                imageVector = Icons.Default.FormatBold,
                                contentDescription = "Bold",
                                tint = if (isBold) Color(0xFF1E88E5) else Color.White
                            )
                        }

                        // Italic button
                        IconButton(
                            onClick = {
                                isItalic = !isItalic
                                applyFormatting()
                            },
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    if (isItalic) Color(0xFF3A3A3A) else Color.Transparent,
                                    CircleShape
                                )
                        ) {
                            Icon(
                                imageVector = Icons.Default.FormatItalic,
                                contentDescription = "Italic",
                                tint = if (isItalic) Color(0xFF1E88E5) else Color.White
                            )
                        }

                        // Underline button
                        IconButton(
                            onClick = {
                                isUnderline = !isUnderline
                                applyFormatting()
                            },
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    if (isUnderline) Color(0xFF3A3A3A) else Color.Transparent,
                                    CircleShape
                                )
                        ) {
                            Icon(
                                imageVector = Icons.Default.FormatUnderlined,
                                contentDescription = "Underline",
                                tint = if (isUnderline) Color(0xFF1E88E5) else Color.White
                            )
                        }

                        // Text alignment button
                        Box {
                            IconButton(
                                onClick = { showFormatMenu = !showFormatMenu },
                                modifier = Modifier.size(40.dp)
                            ) {
                                Icon(
                                    imageVector = when (textAlignmentIndex) {
                                        0 -> Icons.Default.FormatAlignLeft
                                        1 -> Icons.Default.FormatAlignCenter
                                        2 -> Icons.Default.FormatAlignRight
                                        3 -> Icons.Default.FormatAlignJustify
                                        else -> Icons.Default.FormatAlignLeft
                                    },
                                    contentDescription = "Text Alignment",
                                    tint = Color.White
                                )
                            }

                            DropdownMenu(
                                expanded = showFormatMenu,
                                onDismissRequest = { showFormatMenu = false },
                                modifier = Modifier.background(Color(0xFF1E1E1E))
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Align Left", color = Color.White) },
                                    onClick = {
                                        textAlignmentIndex = 0
                                        applyFormatting()
                                        showFormatMenu = false
                                    },
                                    leadingIcon = {
                                        Icon(
                                            Icons.Default.FormatAlignLeft,
                                            contentDescription = null,
                                            tint = Color.White
                                        )
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Align Center", color = Color.White) },
                                    onClick = {
                                        textAlignmentIndex = 1
                                        applyFormatting()
                                        showFormatMenu = false
                                    },
                                    leadingIcon = {
                                        Icon(
                                            Icons.Default.FormatAlignCenter,
                                            contentDescription = null,
                                            tint = Color.White
                                        )
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Align Right", color = Color.White) },
                                    onClick = {
                                        textAlignmentIndex = 2
                                        applyFormatting()
                                        showFormatMenu = false
                                    },
                                    leadingIcon = {
                                        Icon(
                                            Icons.Default.FormatAlignRight,
                                            contentDescription = null,
                                            tint = Color.White
                                        )
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Justify", color = Color.White) },
                                    onClick = {
                                        textAlignmentIndex = 3
                                        applyFormatting()
                                        showFormatMenu = false
                                    },
                                    leadingIcon = {
                                        Icon(
                                            Icons.Default.FormatAlignJustify,
                                            contentDescription = null,
                                            tint = Color.White
                                        )
                                    }
                                )
                            }
                        }

                        // Image attachment button
                        IconButton(
                            onClick = { imagePicker.launch("image/*") },
                            modifier = Modifier.size(40.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Image,
                                contentDescription = "Attach Image",
                                tint = if (imageUri != null) Color(0xFF1E88E5) else Color.White
                            )
                        }
                    }
                }
            }
        }

        // Post button - floating in top right corner
        Button(
            onClick = {
                if (title.isNotBlank() && category.isNotBlank()) {
                    viewModel.createTask(
                        title = title,
                        description = description,
                        category = category,
                        titleSegments = titleSegments.toList(),
                        descriptionSegments = descriptionSegments.toList(),
                        imageUri = imageUri,
                        context = context
                    )
                }
            },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp),
            shape = RoundedCornerShape(20.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF1E88E5),
                contentColor = Color.White
            ),
            enabled = !uiState.isLoading &&
                    title.isNotBlank() &&
                    category.isNotBlank()
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text("Post")
            }
        }
    }
}

// Extension function to handle text selection in TextField
@Composable
fun TextField(
    value: String,
    onValueChange: (String) -> Unit,
    onTextSelection: (Int, Int) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: @Composable (() -> Unit)? = null,
    colors: TextFieldColors = TextFieldDefaults.colors(),
    textStyle: TextStyle = TextStyle.Default,
    singleLine: Boolean = false
) {
    var textFieldValue by remember { mutableStateOf(TextFieldValue(value)) }

    LaunchedEffect(value) {
        if (value != textFieldValue.text) {
            textFieldValue = textFieldValue.copy(text = value)
        }
    }

    TextField(
        value = textFieldValue,
        onValueChange = { newValue ->
            textFieldValue = newValue
            onValueChange(newValue.text)

            // Handle selection
            val selection = newValue.selection
            if (!selection.collapsed) {
                onTextSelection(selection.start, selection.end - 1)
            }
        },
        modifier = modifier,
        placeholder = placeholder,
        colors = colors,
        textStyle = textStyle,
        singleLine = singleLine
    )
}

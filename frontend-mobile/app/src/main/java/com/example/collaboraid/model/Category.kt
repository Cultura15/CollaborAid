package com.example.collaboraid.model

import androidx.compose.ui.graphics.Color

enum class Category {
    ENGINEERING,
    NURSING,
    PROGRAMMING,
    MATHEMATICS,
    PHYSICS,
    CHEMISTRY,
    BIOLOGY,
    PSYCHOLOGY,
    ART_DESIGN,
    MUSIC,
    LITERATURE,
    HISTORY,
    SOCIOLOGY,
    PHILOSOPHY,
    EDUCATION,
    MARKETING,
    BUSINESS_MANAGEMENT,
    FINANCE,
    LEGAL_STUDIES,
    LANGUAGES,
    HEALTH_WELLNESS,
    DATA_SCIENCE,
    MACHINE_LEARNING;

    companion object {
        // Convert string to enum (e.g., "PROGRAMMING" or "Programming" -> PROGRAMMING)
        fun fromString(value: String): Category? {
            return try {
                // Try direct match first (for UPPERCASE_FORMAT)
                valueOf(value.uppercase())
            } catch (e: IllegalArgumentException) {
                try {
                    // Try converting display name format (e.g., "Business Management" -> BUSINESS_MANAGEMENT)
                    fromDisplayName(value)
                } catch (e: IllegalArgumentException) {
                    null
                }
            }
        }

        // Convert enum to display name (e.g., BUSINESS_MANAGEMENT -> Business Management)
        fun toDisplayName(category: Category): String {
            return category.name.replace("_", " ").split(" ").joinToString(" ") { word ->
                word.lowercase().replaceFirstChar { it.uppercase() }
            }
        }

        // Get all categories as display names
        fun getAllDisplayNames(): List<String> {
            val result = values().map { toDisplayName(it) }.toMutableList()
            result.add(0, "For You") // Add "For You" as the first option
            return result
        }

        // Convert display name to enum (e.g., "Business Management" -> BUSINESS_MANAGEMENT)
        fun fromDisplayName(displayName: String): Category {
            val enumName = displayName.uppercase().replace(" ", "_")
            return valueOf(enumName)
        }

        // Get color for a category
        fun getColor(category: String): Pair<Color, Color> {
            // Try to parse the category string to an enum
            return try {
                val enumValue = if (category.contains(" ")) {
                    fromDisplayName(category)
                } else {
                    valueOf(category.uppercase())
                }
                getColorForEnum(enumValue)
            } catch (e: Exception) {
                // Default color if parsing fails
                Pair(Color(0xFF5C1E0A), Color(0xFFFF5722))
            }
        }

        // Get color for a category enum
        fun getColorForEnum(category: Category): Pair<Color, Color> {
            return when (category) {
                ENGINEERING -> Pair(Color(0xFF1A237E), Color.White)
                NURSING -> Pair(Color(0xFFE1F5FE), Color(0xFF01579B))
                PROGRAMMING -> Pair(Color(0xFF263238), Color(0xFF4DB6AC))
                MATHEMATICS -> Pair(Color(0xFFE8F5E9), Color(0xFF2E7D32))
                PHYSICS -> Pair(Color(0xFF311B92), Color.White)
                CHEMISTRY -> Pair(Color(0xFFEFEBE9), Color(0xFF4E342E))
                BIOLOGY -> Pair(Color(0xFF004D40), Color.White)
                PSYCHOLOGY -> Pair(Color(0xFFFCE4EC), Color(0xFFC2185B))
                ART_DESIGN -> Pair(Color(0xFF880E4F), Color.White)
                MUSIC -> Pair(Color(0xFF3E2723), Color(0xFFFFCC80))
                LITERATURE -> Pair(Color(0xFFFFF3E0), Color(0xFFE65100))
                HISTORY -> Pair(Color(0xFF4A148C), Color(0xFFCE93D8))
                SOCIOLOGY -> Pair(Color(0xFFEDE7F6), Color(0xFF4527A0))
                PHILOSOPHY -> Pair(Color(0xFF37474F), Color(0xFFB0BEC5))
                EDUCATION -> Pair(Color(0xFFE0F7FA), Color(0xFF006064))
                MARKETING -> Pair(Color(0xFFBF360C), Color.White)
                BUSINESS_MANAGEMENT -> Pair(Color(0xFF01579B), Color.White)
                FINANCE -> Pair(Color(0xFF004D40), Color(0xFF80CBC4))
                LEGAL_STUDIES -> Pair(Color(0xFF263238), Color(0xFF90A4AE))
                LANGUAGES -> Pair(Color(0xFFFFF8E1), Color(0xFFF57F17))
                HEALTH_WELLNESS -> Pair(Color(0xFFE8F5E9), Color(0xFF1B5E20))
                DATA_SCIENCE -> Pair(Color(0xFF0D47A1), Color.White)
                MACHINE_LEARNING -> Pair(Color(0xFF1A237E), Color(0xFF8C9EFF))
            }
        }
    }
}

package com.example.mylauncher.theme

import androidx.compose.ui.graphics.Color

// Dark Glassmorphism Palette
val DeepIndigoBg = Color(0x99090A1A)
val NearBlackTranslucent = Color(0xCC05060E)
val GlassSurface = Color(0x26FFFFFF)
val GlassBorder = Color(0x33FFFFFF)
val TextPrimary = Color(0xFFF0F4F8)
val TextSecondary = Color(0xFFA0AAB8)

// 6 Selectable Accent Presets
val NeonCyan = Color(0xFF00E5FF)
val NeonViolet = Color(0xFF7C4DFF)
val NeonEmerald = Color(0xFF00E676)
val NeonRose = Color(0xFFFF1744)
val NeonAmber = Color(0xFFFFAB00)
val NeonElectricBlue = Color(0xFF2979FF)

val AccentPresets = listOf(
    NeonCyan,
    NeonViolet,
    NeonEmerald,
    NeonRose,
    NeonAmber,
    NeonElectricBlue
)

fun getAccentColor(index: Int): Color {
    return AccentPresets.getOrElse(index) { NeonCyan }
}

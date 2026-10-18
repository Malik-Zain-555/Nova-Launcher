package com.example.mylauncher.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private fun createDarkColorScheme(accent: Color) = darkColorScheme(
    primary = accent,
    onPrimary = Color.Black,
    secondary = NeonViolet,
    onSecondary = Color.White,
    background = Color.Transparent,
    surface = DeepIndigoBg,
    onSurface = TextPrimary,
    surfaceVariant = GlassSurface,
    onSurfaceVariant = TextSecondary
)

private fun createLightColorScheme(accent: Color) = lightColorScheme(
    primary = accent,
    onPrimary = Color.White,
    secondary = NeonViolet,
    onSecondary = Color.White,
    background = Color.Transparent,
    surface = Color(0xAAFFFFFF),
    onSurface = Color(0xFF101320),
    surfaceVariant = Color(0x66FFFFFF),
    onSurfaceVariant = Color(0xFF404855)
)

@Composable
fun NovaLauncherTheme(
    accentColorIndex: Int = 0,
    themeMode: String = "dark",
    content: @Composable () -> Unit
) {
    val accent = getAccentColor(accentColorIndex)
    val isDark = when (themeMode) {
        "light" -> false
        "system" -> isSystemInDarkTheme()
        else -> true
    }

    val colorScheme = if (isDark) {
        createDarkColorScheme(accent)
    } else {
        createLightColorScheme(accent)
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}

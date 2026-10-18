package com.example.mylauncher.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mylauncher.theme.AccentPresets
import com.example.mylauncher.theme.DeepIndigoBg
import com.example.mylauncher.theme.TextPrimary
import com.example.mylauncher.theme.TextSecondary
import com.example.mylauncher.util.glassmorphic
import kotlin.math.roundToInt

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onBack: () -> Unit
) {
    val gridColumns by viewModel.gridColumns.collectAsState()
    val iconSize by viewModel.iconSize.collectAsState()
    val accentColorIndex by viewModel.accentColorIndex.collectAsState()
    val themeMode by viewModel.themeMode.collectAsState()
    val animationSpeed by viewModel.animationSpeed.collectAsState()
    val isBlurEnabled by viewModel.isBlurEnabled.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .glassmorphic(
                shape = RoundedCornerShape(0.dp),
                backgroundColor = DeepIndigoBg,
                isBlurEnabled = isBlurEnabled
            )
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Rounded.ArrowBack,
                        contentDescription = "Back",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                Text(
                    text = "Launcher Settings",
                    style = MaterialTheme.typography.headlineSmall,
                    color = TextPrimary,
                    modifier = Modifier.padding(start = 8.dp)
                )
            }

            // Grid Columns Section
            SettingsCard(title = "Grid Columns: $gridColumns", isBlurEnabled = isBlurEnabled) {
                Slider(
                    value = gridColumns.toFloat(),
                    onValueChange = { viewModel.setGridColumns(it.roundToInt()) },
                    valueRange = 3f..6f,
                    steps = 2,
                    colors = SliderDefaults.colors(
                        thumbColor = MaterialTheme.colorScheme.primary,
                        activeTrackColor = MaterialTheme.colorScheme.primary
                    )
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Icon Size Section
            SettingsCard(title = "Icon Size: ${iconSize}dp", isBlurEnabled = isBlurEnabled) {
                Slider(
                    value = iconSize.toFloat(),
                    onValueChange = { viewModel.setIconSize(it.roundToInt()) },
                    valueRange = 40f..72f,
                    steps = 7,
                    colors = SliderDefaults.colors(
                        thumbColor = MaterialTheme.colorScheme.primary,
                        activeTrackColor = MaterialTheme.colorScheme.primary
                    )
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Accent Color Presets
            SettingsCard(title = "Accent Color (6 Presets)", isBlurEnabled = isBlurEnabled) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    AccentPresets.forEachIndexed { index, color ->
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(color)
                                .clickable { viewModel.setAccentColorIndex(index) }
                                .then(
                                    if (accentColorIndex == index) {
                                        Modifier.border(3.dp, Color.White, CircleShape)
                                    } else Modifier
                                )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Theme Mode
            SettingsCard(title = "Theme", isBlurEnabled = isBlurEnabled) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("dark", "light", "system").forEach { mode ->
                        FilterChip(
                            selected = themeMode == mode,
                            onClick = { viewModel.setThemeMode(mode) },
                            label = { Text(mode.replaceFirstChar { it.uppercase() }) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = Color.Black
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Animation Speed
            SettingsCard(title = "Spring Animation Speed", isBlurEnabled = isBlurEnabled) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("slow", "normal", "fast").forEach { speed ->
                        FilterChip(
                            selected = animationSpeed == speed,
                            onClick = { viewModel.setAnimationSpeed(speed) },
                            label = { Text(speed.replaceFirstChar { it.uppercase() }) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = Color.Black
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Blur Toggle
            SettingsCard(title = "Blur Effect (Android 12+)", isBlurEnabled = isBlurEnabled) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isBlurEnabled) "Enabled (Glassmorphic Blur)" else "Disabled (Plain Translucent)",
                        color = TextSecondary,
                        fontSize = 14.sp
                    )
                    Switch(
                        checked = isBlurEnabled,
                        onCheckedChange = { viewModel.setBlurEnabled(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = MaterialTheme.colorScheme.primary,
                            checkedTrackColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun SettingsCard(
    title: String,
    isBlurEnabled: Boolean,
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .glassmorphic(shape = RoundedCornerShape(24.dp), isBlurEnabled = isBlurEnabled),
        colors = CardDefaults.cardColors(containerColor = DeepIndigoBg),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary
            )
            content()
        }
    }
}

package com.example.mylauncher.util

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.mylauncher.theme.GlassBorder

/**
 * Applies Android 12+ hardware blur or a plain translucent fallback on older versions or when blur is disabled.
 */
fun Modifier.glassmorphic(
    blurRadius: Dp = 25.dp,
    shape: Shape = RoundedCornerShape(28.dp),
    backgroundColor: Color = Color(0x3310142A),
    borderColor: Color = GlassBorder,
    borderWidth: Dp = 1.dp,
    isBlurEnabled: Boolean = true
): Modifier {
    val canBlur = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && isBlurEnabled
    return this
        .then(if (canBlur) Modifier.blur(blurRadius) else Modifier)
        .clip(shape)
        .background(backgroundColor)
        .border(borderWidth, borderColor, shape)
}

package com.example.mylauncher.util

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.SpringSpec
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput

/**
 * Provides spring configurations based on user animation speed setting.
 */
fun <T> getSpringSpec(speed: String): SpringSpec<T> {
    val stiffness = when (speed) {
        "slow" -> Spring.StiffnessLow
        "fast" -> Spring.StiffnessHigh
        else -> Spring.StiffnessMedium
    }
    return spring(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = stiffness
    )
}

/**
 * Adds spring scale feedback on tap/press.
 */
@Composable
fun Modifier.springPressScale(
    targetScale: Float = 0.92f,
    speed: String = "normal",
    onTap: () -> Unit = {},
    onLongPress: () -> Unit = {}
): Modifier {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) targetScale else 1.0f,
        animationSpec = getSpringSpec(speed),
        label = "SpringPressScale"
    )

    return this
        .graphicsLayer {
            scaleX = scale
            scaleY = scale
        }
        .pointerInput(Unit) {
            detectTapGestures(
                onPress = {
                    isPressed = true
                    try {
                        tryAwaitRelease()
                    } finally {
                        isPressed = false
                    }
                },
                onTap = { onTap() },
                onLongPress = { onLongPress() }
            )
        }
}

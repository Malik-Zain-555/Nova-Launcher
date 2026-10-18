package com.example.mylauncher.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AddCircle
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Dock
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.RemoveCircle
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mylauncher.data.AppModel
import com.example.mylauncher.theme.NearBlackTranslucent
import com.example.mylauncher.util.glassmorphic

@Composable
fun AppActionMenu(
    app: AppModel,
    isPinned: Boolean,
    isInDock: Boolean,
    isBlurEnabled: Boolean,
    onDismiss: () -> Unit,
    onAppInfo: () -> Unit,
    onUninstall: () -> Unit,
    onTogglePin: () -> Unit,
    onToggleDock: () -> Unit
) {
    // Backdrop tap to dismiss
    Box(
        modifier = Modifier
            .fillMaxSize()
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .width(280.dp)
                .glassmorphic(shape = RoundedCornerShape(28.dp), isBlurEnabled = isBlurEnabled)
                .clickable(enabled = false) {}, // prevent click-through
            colors = CardDefaults.cardColors(containerColor = NearBlackTranslucent),
            shape = RoundedCornerShape(28.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = app.label,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                ActionItem(
                    icon = Icons.Rounded.Info,
                    label = "App Info",
                    onClick = onAppInfo
                )
                ActionItem(
                    icon = Icons.Rounded.Delete,
                    label = "Uninstall",
                    onClick = onUninstall
                )
                ActionItem(
                    icon = if (isPinned) Icons.Rounded.RemoveCircle else Icons.Rounded.AddCircle,
                    label = if (isPinned) "Remove from Home" else "Add to Home",
                    onClick = onTogglePin
                )
                ActionItem(
                    icon = Icons.Rounded.Dock,
                    label = if (isInDock) "Remove from Dock" else "Add to Dock",
                    onClick = onToggleDock
                )
            }
        }
    }
}

@Composable
private fun ActionItem(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = label,
            fontSize = 15.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

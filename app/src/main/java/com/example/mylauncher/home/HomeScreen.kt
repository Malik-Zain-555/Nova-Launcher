package com.example.mylauncher.home

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.ExperimentalFoundationApi
import com.example.mylauncher.data.AppModel
import com.example.mylauncher.theme.DeepIndigoBg
import com.example.mylauncher.theme.TextPrimary
import com.example.mylauncher.util.glassmorphic
import com.example.mylauncher.util.springPressScale

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onOpenDrawer: () -> Unit,
    onOpenSettings: () -> Unit,
    onMenuStateChanged: (Boolean) -> Unit
) {
    val context = LocalContext.current
    val pinnedApps by viewModel.pinnedApps.collectAsState()
    val dockApps by viewModel.dockApps.collectAsState()
    val gridColumns by viewModel.gridColumns.collectAsState()
    val iconSize by viewModel.iconSize.collectAsState()
    val animationSpeed by viewModel.animationSpeed.collectAsState()
    val isBlurEnabled by viewModel.isBlurEnabled.collectAsState()

    var selectedAppForMenu by remember { mutableStateOf<AppModel?>(null) }

    fun launchApp(app: AppModel) {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(app.packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
        }
    }

    // Outer container detecting drag up to open drawer, long press for settings
    Box(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
            .combinedClickable(
                onClick = {},
                onLongClick = { onOpenSettings() }
            )
            .draggable(
                state = rememberDraggableState { delta ->
                    if (delta < -20f) {
                        onOpenDrawer()
                    }
                },
                orientation = Orientation.Vertical
            )
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Pinned Apps Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(gridColumns),
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 20.dp),
                contentPadding = PaddingValues(8.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(pinnedApps, key = { it.packageName }) { app ->
                    AppIconItem(
                        app = app,
                        iconSize = iconSize,
                        speed = animationSpeed,
                        onClick = { launchApp(app) },
                        onLongClick = {
                            selectedAppForMenu = app
                            onMenuStateChanged(true)
                        }
                    )
                }
            }

            // Bottom Area: Swipe Up Handle + Glassmorphic Dock
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Swipe Up Handle
                Box(
                    modifier = Modifier
                        .padding(bottom = 10.dp)
                        .size(width = 44.dp, height = 5.dp)
                        .clip(CircleShape)
                        .background(TextPrimary.copy(alpha = 0.4f))
                        .springPressScale(speed = animationSpeed, onTap = { onOpenDrawer() })
                )

                // Dock Card (4 Apps)
                Card(
                    modifier = Modifier
                        .fillMaxWidth(0.92f)
                        .height(84.dp)
                        .glassmorphic(
                            shape = RoundedCornerShape(28.dp),
                            backgroundColor = DeepIndigoBg,
                            isBlurEnabled = isBlurEnabled
                        ),
                    colors = CardDefaults.cardColors(containerColor = DeepIndigoBg),
                    shape = RoundedCornerShape(28.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 12.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        dockApps.take(4).forEach { app ->
                            AppIconItem(
                                app = app,
                                iconSize = iconSize.coerceAtMost(52),
                                showLabel = false,
                                speed = animationSpeed,
                                onClick = { launchApp(app) },
                                onLongClick = {
                                    selectedAppForMenu = app
                                    onMenuStateChanged(true)
                                }
                            )
                        }
                    }
                }
            }
        }

        // Long Press Context Menu
        selectedAppForMenu?.let { app ->
            val isPinned = pinnedApps.any { it.packageName == app.packageName }
            val isInDock = dockApps.any { it.packageName == app.packageName }

            AppActionMenu(
                app = app,
                isPinned = isPinned,
                isInDock = isInDock,
                isBlurEnabled = isBlurEnabled,
                onDismiss = {
                    selectedAppForMenu = null
                    onMenuStateChanged(false)
                },
                onAppInfo = {
                    val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                        data = Uri.fromParts("package", app.packageName, null)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(intent)
                    selectedAppForMenu = null
                    onMenuStateChanged(false)
                },
                onUninstall = {
                    val intent = Intent(Intent.ACTION_DELETE).apply {
                        data = Uri.fromParts("package", app.packageName, null)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(intent)
                    selectedAppForMenu = null
                    onMenuStateChanged(false)
                },
                onTogglePin = {
                    viewModel.togglePinApp(app.packageName)
                    selectedAppForMenu = null
                    onMenuStateChanged(false)
                },
                onToggleDock = {
                    viewModel.toggleDockApp(app.packageName)
                    selectedAppForMenu = null
                    onMenuStateChanged(false)
                }
            )
        }
    }
}

@Composable
fun AppIconItem(
    app: AppModel,
    iconSize: Int,
    showLabel: Boolean = true,
    speed: String = "normal",
    onClick: () -> Unit,
    onLongClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .springPressScale(
                speed = speed,
                onTap = onClick,
                onLongPress = onLongClick
            ),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (app.icon != null) {
            Image(
                bitmap = app.icon.asImageBitmap(),
                contentDescription = app.label,
                modifier = Modifier
                    .size(iconSize.dp)
                    .clip(RoundedCornerShape(20.dp))
            )
        } else {
            Box(
                modifier = Modifier
                    .size(iconSize.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(DeepIndigoBg)
            )
        }

        if (showLabel) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = app.label,
                fontSize = 12.sp,
                color = TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center
            )
        }
    }
}

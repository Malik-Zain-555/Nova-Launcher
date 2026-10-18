package com.example.mylauncher.drawer

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mylauncher.data.AppModel
import com.example.mylauncher.home.AppActionMenu
import com.example.mylauncher.home.AppIconItem
import com.example.mylauncher.home.HomeViewModel
import com.example.mylauncher.theme.NearBlackTranslucent
import com.example.mylauncher.theme.TextPrimary
import com.example.mylauncher.theme.TextSecondary
import com.example.mylauncher.util.glassmorphic
import com.example.mylauncher.util.getSpringSpec

@Composable
fun AppDrawer(
    isOpen: Boolean,
    viewModel: DrawerViewModel,
    homeViewModel: HomeViewModel,
    onClose: () -> Unit,
    onMenuStateChanged: (Boolean) -> Unit
) {
    val context = LocalContext.current
    val searchQuery by viewModel.searchQuery.collectAsState()
    val groupedApps by viewModel.filteredGroupedApps.collectAsState()
    val gridColumns by homeViewModel.gridColumns.collectAsState()
    val iconSize by homeViewModel.iconSize.collectAsState()
    val animationSpeed by homeViewModel.animationSpeed.collectAsState()
    val isBlurEnabled by homeViewModel.isBlurEnabled.collectAsState()

    val pinnedApps by homeViewModel.pinnedApps.collectAsState()
    val dockApps by homeViewModel.dockApps.collectAsState()

    var selectedAppForMenu by remember { mutableStateOf<AppModel?>(null) }

    fun launchApp(app: AppModel) {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(app.packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
            onClose()
        }
    }

    AnimatedVisibility(
        visible = isOpen,
        enter = slideInVertically(
            initialOffsetY = { it },
            animationSpec = getSpringSpec(animationSpeed)
        ),
        exit = slideOutVertically(
            targetOffsetY = { it },
            animationSpec = getSpringSpec(animationSpeed)
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .glassmorphic(
                    shape = RoundedCornerShape(0.dp),
                    backgroundColor = NearBlackTranslucent,
                    isBlurEnabled = isBlurEnabled
                )
                .statusBarsPadding()
                .navigationBarsPadding()
                .draggable(
                    state = rememberDraggableState { delta ->
                        if (delta > 25f) onClose()
                    },
                    orientation = Orientation.Vertical
                )
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Top Down-handle indicator
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(width = 44.dp, height = 5.dp)
                            .clip(CircleShape)
                            .background(TextPrimary.copy(alpha = 0.4f))
                    )
                }

                // Glassmorphic Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.setSearchQuery(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp)
                        .glassmorphic(
                            shape = RoundedCornerShape(24.dp),
                            backgroundColor = Color(0x331E2243),
                            isBlurEnabled = isBlurEnabled
                        ),
                    placeholder = { Text("Search apps...", color = TextSecondary) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Rounded.Search,
                            contentDescription = "Search",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.setSearchQuery("") }) {
                                Icon(
                                    imageVector = Icons.Rounded.Close,
                                    contentDescription = "Clear",
                                    tint = TextSecondary
                                )
                            }
                        }
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = Color.Transparent,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    singleLine = true,
                    shape = RoundedCornerShape(24.dp)
                )

                // Alphabetical Apps Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(gridColumns),
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    groupedApps.forEach { (sectionChar, apps) ->
                        // Section Letter Header
                        item(span = { GridItemSpan(gridColumns) }) {
                            Text(
                                text = sectionChar.toString(),
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(start = 8.dp, top = 16.dp, bottom = 4.dp)
                            )
                        }

                        // App Items
                        items(apps.size, key = { index -> apps[index].packageName }) { index ->
                            val app = apps[index]
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
                }
            }

            // Long Press Menu inside Drawer
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
                        homeViewModel.togglePinApp(app.packageName)
                        selectedAppForMenu = null
                        onMenuStateChanged(false)
                    },
                    onToggleDock = {
                        homeViewModel.toggleDockApp(app.packageName)
                        selectedAppForMenu = null
                        onMenuStateChanged(false)
                    }
                )
            }
        }
    }
}

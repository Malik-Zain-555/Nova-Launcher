package com.example.mylauncher

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.example.mylauncher.data.AppRepository
import com.example.mylauncher.data.PackageChangeReceiver
import com.example.mylauncher.data.SettingsDataStore
import com.example.mylauncher.drawer.AppDrawer
import com.example.mylauncher.drawer.DrawerViewModel
import com.example.mylauncher.home.HomeScreen
import com.example.mylauncher.home.HomeViewModel
import com.example.mylauncher.settings.SettingsScreen
import com.example.mylauncher.settings.SettingsViewModel
import com.example.mylauncher.theme.NovaLauncherTheme

class MainActivity : ComponentActivity() {

    private lateinit var appRepository: AppRepository
    private lateinit var settingsDataStore: SettingsDataStore
    private lateinit var homeViewModel: HomeViewModel
    private lateinit var drawerViewModel: DrawerViewModel
    private lateinit var settingsViewModel: SettingsViewModel
    private lateinit var packageChangeReceiver: PackageChangeReceiver

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        appRepository = AppRepository(applicationContext)
        settingsDataStore = SettingsDataStore(applicationContext)

        homeViewModel = HomeViewModel(appRepository, settingsDataStore)
        drawerViewModel = DrawerViewModel(appRepository)
        settingsViewModel = SettingsViewModel(settingsDataStore)

        // Broadcast receiver for installed / removed apps
        packageChangeReceiver = PackageChangeReceiver {
            homeViewModel.reloadApps()
        }
        packageChangeReceiver.register(this)

        setContent {
            val accentIndex by settingsViewModel.accentColorIndex.collectAsState()
            val themeMode by settingsViewModel.themeMode.collectAsState()

            var isDrawerOpen by remember { mutableStateOf(false) }
            var isSettingsOpen by remember { mutableStateOf(false) }
            var isActionMenuOpen by remember { mutableStateOf(false) }

            // Back button priority:
            // 1. Close long-press Action Menu
            // 2. Close Settings screen
            // 3. Close Drawer
            // 4. Do nothing (never exit launcher)
            BackHandler(enabled = true) {
                when {
                    isActionMenuOpen -> isActionMenuOpen = false
                    isSettingsOpen -> isSettingsOpen = false
                    isDrawerOpen -> isDrawerOpen = false
                    else -> {
                        // Consumed: Launcher does not close or exit
                    }
                }
            }

            NovaLauncherTheme(
                accentColorIndex = accentIndex,
                themeMode = themeMode
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    // Home Screen (always active underneath)
                    HomeScreen(
                        viewModel = homeViewModel,
                        onOpenDrawer = { isDrawerOpen = true },
                        onOpenSettings = { isSettingsOpen = true },
                        onMenuStateChanged = { isOpen -> isActionMenuOpen = isOpen }
                    )

                    // App Drawer
                    AppDrawer(
                        isOpen = isDrawerOpen,
                        viewModel = drawerViewModel,
                        homeViewModel = homeViewModel,
                        onClose = { isDrawerOpen = false },
                        onMenuStateChanged = { isOpen -> isActionMenuOpen = isOpen }
                    )

                    // Settings Screen
                    if (isSettingsOpen) {
                        SettingsScreen(
                            viewModel = settingsViewModel,
                            onBack = { isSettingsOpen = false }
                        )
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        packageChangeReceiver.unregister(this)
    }
}

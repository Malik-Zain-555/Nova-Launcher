package com.example.mylauncher.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mylauncher.data.AppModel
import com.example.mylauncher.data.AppRepository
import com.example.mylauncher.data.SettingsDataStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class HomeViewModel(
    private val appRepository: AppRepository,
    private val settingsDataStore: SettingsDataStore
) : ViewModel() {

    val gridColumns: StateFlow<Int> = settingsDataStore.gridColumnsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 4)

    val iconSize: StateFlow<Int> = settingsDataStore.iconSizeFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 56)

    val animationSpeed: StateFlow<String> = settingsDataStore.animationSpeedFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "normal")

    val isBlurEnabled: StateFlow<Boolean> = settingsDataStore.blurEnabledFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val pinnedApps: StateFlow<List<AppModel>> = combine(
        appRepository.installedApps,
        settingsDataStore.pinnedAppsFlow
    ) { apps, pinnedSet ->
        apps.filter { pinnedSet.contains(it.packageName) }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val dockApps: StateFlow<List<AppModel>> = combine(
        appRepository.installedApps,
        settingsDataStore.dockAppsFlow
    ) { apps, dockSet ->
        // Keep order or take up to 4
        dockSet.mapNotNull { pkg -> apps.find { it.packageName == pkg } }.take(4)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        viewModelScope.launch {
            appRepository.loadApps()
            checkAndAutoFillFirstRunDock()
        }
    }

    fun reloadApps() {
        viewModelScope.launch {
            appRepository.loadApps()
        }
    }

    private suspend fun checkAndAutoFillFirstRunDock() {
        settingsDataStore.isFirstRunFlow.collect { isFirstRun ->
            if (isFirstRun) {
                val apps = appRepository.installedApps.value
                val dockDefaults = mutableSetOf<String>()

                // Look for Phone, Messages, Browser, Camera
                val phoneApp = apps.find { it.packageName.contains("dialer") || it.packageName.contains("phone") }
                val msgApp = apps.find { it.packageName.contains("messaging") || it.packageName.contains("mms") }
                val browserApp = apps.find { it.packageName.contains("chrome") || it.packageName.contains("browser") }
                val cameraApp = apps.find { it.packageName.contains("camera") }

                phoneApp?.let { dockDefaults.add(it.packageName) }
                msgApp?.let { dockDefaults.add(it.packageName) }
                browserApp?.let { dockDefaults.add(it.packageName) }
                cameraApp?.let { dockDefaults.add(it.packageName) }

                // Fallback to first available apps if specific targets not found
                if (dockDefaults.size < 4) {
                    for (app in apps) {
                        if (dockDefaults.size >= 4) break
                        dockDefaults.add(app.packageName)
                    }
                }

                settingsDataStore.setDockApps(dockDefaults)
                settingsDataStore.setFirstRunCompleted()
            }
        }
    }

    fun togglePinApp(packageName: String) {
        viewModelScope.launch {
            val currentPinned = pinnedApps.value.map { it.packageName }.toMutableSet()
            if (currentPinned.contains(packageName)) {
                currentPinned.remove(packageName)
            } else {
                currentPinned.add(packageName)
            }
            settingsDataStore.setPinnedApps(currentPinned)
        }
    }

    fun toggleDockApp(packageName: String) {
        viewModelScope.launch {
            val currentDock = dockApps.value.map { it.packageName }.toMutableList()
            if (currentDock.contains(packageName)) {
                currentDock.remove(packageName)
            } else {
                if (currentDock.size < 4) {
                    currentDock.add(packageName)
                }
            }
            settingsDataStore.setDockApps(currentDock.toSet())
        }
    }
}

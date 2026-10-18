package com.example.mylauncher.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mylauncher.data.SettingsDataStore
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SettingsViewModel(
    private val settingsDataStore: SettingsDataStore
) : ViewModel() {

    val gridColumns: StateFlow<Int> = settingsDataStore.gridColumnsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 4)

    val iconSize: StateFlow<Int> = settingsDataStore.iconSizeFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 56)

    val accentColorIndex: StateFlow<Int> = settingsDataStore.accentColorIndexFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val themeMode: StateFlow<String> = settingsDataStore.themeModeFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "dark")

    val animationSpeed: StateFlow<String> = settingsDataStore.animationSpeedFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "normal")

    val isBlurEnabled: StateFlow<Boolean> = settingsDataStore.blurEnabledFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    fun setGridColumns(cols: Int) {
        viewModelScope.launch { settingsDataStore.setGridColumns(cols) }
    }

    fun setIconSize(sizeDp: Int) {
        viewModelScope.launch { settingsDataStore.setIconSize(sizeDp) }
    }

    fun setAccentColorIndex(index: Int) {
        viewModelScope.launch { settingsDataStore.setAccentColorIndex(index) }
    }

    fun setThemeMode(mode: String) {
        viewModelScope.launch { settingsDataStore.setThemeMode(mode) }
    }

    fun setAnimationSpeed(speed: String) {
        viewModelScope.launch { settingsDataStore.setAnimationSpeed(speed) }
    }

    fun setBlurEnabled(enabled: Boolean) {
        viewModelScope.launch { settingsDataStore.setBlurEnabled(enabled) }
    }
}

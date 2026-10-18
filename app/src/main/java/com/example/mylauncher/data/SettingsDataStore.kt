package com.example.mylauncher.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "nova_launcher_settings")

class SettingsDataStore(private val context: Context) {

    companion object {
        val KEY_GRID_COLUMNS = intPreferencesKey("grid_columns")
        val KEY_ICON_SIZE = intPreferencesKey("icon_size")
        val KEY_ACCENT_COLOR = intPreferencesKey("accent_color_index")
        val KEY_THEME_MODE = stringPreferencesKey("theme_mode")
        val KEY_ANIMATION_SPEED = stringPreferencesKey("animation_speed")
        val KEY_BLUR_ENABLED = booleanPreferencesKey("blur_enabled")
        val KEY_PINNED_APPS = stringSetPreferencesKey("pinned_apps")
        val KEY_DOCK_APPS = stringSetPreferencesKey("dock_apps")
        val KEY_IS_FIRST_RUN = booleanPreferencesKey("is_first_run")
    }

    val gridColumnsFlow: Flow<Int> = context.dataStore.data.map { it[KEY_GRID_COLUMNS] ?: 4 }
    val iconSizeFlow: Flow<Int> = context.dataStore.data.map { it[KEY_ICON_SIZE] ?: 56 }
    val accentColorIndexFlow: Flow<Int> = context.dataStore.data.map { it[KEY_ACCENT_COLOR] ?: 0 }
    val themeModeFlow: Flow<String> = context.dataStore.data.map { it[KEY_THEME_MODE] ?: "dark" }
    val animationSpeedFlow: Flow<String> = context.dataStore.data.map { it[KEY_ANIMATION_SPEED] ?: "normal" }
    val blurEnabledFlow: Flow<Boolean> = context.dataStore.data.map { it[KEY_BLUR_ENABLED] ?: true }

    val pinnedAppsFlow: Flow<Set<String>> = context.dataStore.data.map { it[KEY_PINNED_APPS] ?: emptySet() }
    val dockAppsFlow: Flow<Set<String>> = context.dataStore.data.map { it[KEY_DOCK_APPS] ?: emptySet() }
    val isFirstRunFlow: Flow<Boolean> = context.dataStore.data.map { it[KEY_IS_FIRST_RUN] ?: true }

    suspend fun setGridColumns(cols: Int) {
        context.dataStore.edit { it[KEY_GRID_COLUMNS] = cols.coerceIn(3, 6) }
    }

    suspend fun setIconSize(sizeDp: Int) {
        context.dataStore.edit { it[KEY_ICON_SIZE] = sizeDp.coerceIn(40, 72) }
    }

    suspend fun setAccentColorIndex(index: Int) {
        context.dataStore.edit { it[KEY_ACCENT_COLOR] = index }
    }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { it[KEY_THEME_MODE] = mode }
    }

    suspend fun setAnimationSpeed(speed: String) {
        context.dataStore.edit { it[KEY_ANIMATION_SPEED] = speed }
    }

    suspend fun setBlurEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_BLUR_ENABLED] = enabled }
    }

    suspend fun setPinnedApps(packageNames: Set<String>) {
        context.dataStore.edit { it[KEY_PINNED_APPS] = packageNames }
    }

    suspend fun setDockApps(packageNames: Set<String>) {
        context.dataStore.edit { it[KEY_DOCK_APPS] = packageNames }
    }

    suspend fun setFirstRunCompleted() {
        context.dataStore.edit { it[KEY_IS_FIRST_RUN] = false }
    }
}

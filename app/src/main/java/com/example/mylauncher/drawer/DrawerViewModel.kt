package com.example.mylauncher.drawer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mylauncher.data.AppModel
import com.example.mylauncher.data.AppRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

class DrawerViewModel(
    private val appRepository: AppRepository
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    val filteredGroupedApps: StateFlow<Map<Char, List<AppModel>>> = combine(
        appRepository.installedApps,
        _searchQuery
    ) { apps, query ->
        val filtered = if (query.isBlank()) {
            apps
        } else {
            apps.filter { it.label.contains(query, ignoreCase = true) }
        }

        filtered.groupBy { app ->
            val firstChar = app.label.firstOrNull()?.uppercaseChar() ?: '#'
            if (firstChar.isLetter()) firstChar else '#'
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }
}

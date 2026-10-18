package com.example.mylauncher.data

import android.graphics.Bitmap

/**
 * Represents a launchable application item.
 */
data class AppModel(
    val label: String,
    val packageName: String,
    val activityName: String,
    val icon: Bitmap? = null
)

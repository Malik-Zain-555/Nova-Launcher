package com.example.mylauncher.data

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.LruCache
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

class AppRepository(private val context: Context) {

    private val packageManager: PackageManager = context.packageManager

    // Cache app icons in memory using an LruCache (up to 30MB)
    private val iconCache = object : LruCache<String, Bitmap>(30 * 1024 * 1024) {
        override fun sizeOf(key: String, value: Bitmap): Int {
            return value.byteCount
        }
    }

    private val _installedApps = MutableStateFlow<List<AppModel>>(emptyList())
    val installedApps: StateFlow<List<AppModel>> = _installedApps.asStateFlow()

    suspend fun loadApps() {
        withContext(Dispatchers.IO) {
            val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }

            val resolveInfos = packageManager.queryIntentActivities(mainIntent, 0)
            val appList = mutableListOf<AppModel>()

            for (info in resolveInfos) {
                val pkg = info.activityInfo.packageName
                // Skip launcher itself
                if (pkg == context.packageName) continue

                val label = info.loadLabel(packageManager).toString()
                val activityName = info.activityInfo.name
                val icon = getOrLoadIcon(pkg, info.activityInfo.loadIcon(packageManager))

                appList.add(
                    AppModel(
                        label = label,
                        packageName = pkg,
                        activityName = activityName,
                        icon = icon
                    )
                )
            }

            appList.sortBy { it.label.lowercase() }
            _installedApps.value = appList
        }
    }

    private fun getOrLoadIcon(packageName: String, drawable: Drawable): Bitmap {
        val cached = iconCache.get(packageName)
        if (cached != null) return cached

        val bitmap = drawableToBitmap(drawable)
        iconCache.put(packageName, bitmap)
        return bitmap
    }

    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        if (drawable is BitmapDrawable && drawable.bitmap != null) {
            return drawable.bitmap
        }

        val width = if (drawable.intrinsicWidth <= 0) 120 else drawable.intrinsicWidth
        val height = if (drawable.intrinsicHeight <= 0) 120 else drawable.intrinsicHeight

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }
}

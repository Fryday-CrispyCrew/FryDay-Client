package com.crispycrew.fryday.widget

import android.content.Context
import android.util.Log
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.state.updateAppWidgetState
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.json.JSONArray
import org.json.JSONObject

class ToggleTodoAction : ActionCallback {

    companion object {
        val todoIdKey = ActionParameters.Key<String>("todoId")
        private val TICK_KEY = longPreferencesKey("_widgetTick")
        // 여러 intent 가 동시 실행될 때 read-modify-write race 방지용 mutex
        private val writeMutex = Mutex()
    }

    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val todoId = parameters[todoIdKey] ?: return
        Log.d("ToggleTodoAction", "Toggling todoId: $todoId")
        val prefs = context.getSharedPreferences("fryday_widget", Context.MODE_PRIVATE)

        // Mutex 로 read-modify-write 원자화
        writeMutex.withLock {
            val pendingCurrent = prefs.getString("pendingToggleIds", null)
            val pendingList = mutableListOf<String>()
            if (pendingCurrent != null) {
                try {
                    val arr = JSONArray(pendingCurrent)
                    for (i in 0 until arr.length()) pendingList.add(arr.getString(i))
                } catch (_: Exception) {}
            }
            if (pendingList.contains(todoId)) pendingList.remove(todoId) else pendingList.add(todoId)

            val newPending = JSONArray()
            pendingList.forEach { newPending.put(it) }
            prefs.edit()
                .putString("pendingToggleIds", newPending.toString())
                .commit()
            Log.d("ToggleTodoAction", "pending updated: $pendingList")
        }

        val manager = GlanceAppWidgetManager(context)
        val smallInstance = FrydayWidgetSmall()
        val mediumInstance = FrydayWidgetMediumList()
        val tick = System.currentTimeMillis()

        manager.getGlanceIds(FrydayWidgetSmall::class.java).forEach { id ->
            updateAppWidgetState(context, id) { p -> p[TICK_KEY] = tick }
            smallInstance.update(context, id)
        }
        manager.getGlanceIds(FrydayWidgetMediumList::class.java).forEach { id ->
            updateAppWidgetState(context, id) { p -> p[TICK_KEY] = tick }
            mediumInstance.update(context, id)
        }
    }
}

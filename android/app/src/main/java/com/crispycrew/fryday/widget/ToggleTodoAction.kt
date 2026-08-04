package com.crispycrew.fryday.widget

import android.content.Context
import android.util.Log
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.state.updateAppWidgetState
import org.json.JSONArray
import org.json.JSONObject

class ToggleTodoAction : ActionCallback {

    companion object {
        val todoIdKey = ActionParameters.Key<String>("todoId")
        private val TICK_KEY = longPreferencesKey("_widgetTick")
    }

    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val todoId = parameters[todoIdKey] ?: return
        Log.d("ToggleTodoAction", "Toggling todoId: $todoId")
        val prefs = context.getSharedPreferences("fryday_widget", Context.MODE_PRIVATE)

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

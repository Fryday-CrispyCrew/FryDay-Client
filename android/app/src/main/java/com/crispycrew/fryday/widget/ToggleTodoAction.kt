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

        writeMutex.withLock {
            val raw = SharedFileStorage.readString(context, SharedFileStorage.PENDING_FILE)
            val pendingList = mutableListOf<String>()
            val beforeMap = mutableMapOf<String, Boolean>()
            if (raw != null) {
                try {
                    val obj = JSONObject(raw)
                    obj.optJSONArray("ids")?.let { arr ->
                        for (i in 0 until arr.length()) pendingList.add(arr.getString(i))
                    }
                    obj.optJSONObject("before")?.let { before ->
                        val keys = before.keys()
                        while (keys.hasNext()) {
                            val k = keys.next()
                            beforeMap[k] = before.optBoolean(k, false)
                        }
                    }
                } catch (_: Exception) {}
            }

            if (pendingList.contains(todoId)) {
                pendingList.remove(todoId)
                beforeMap.remove(todoId)
            } else {
                pendingList.add(todoId)
                // tap 시점의 isDone 을 저장 (widget-todos.json 파일에서 조회)
                var currentIsDone = false
                val todosByDateStr = SharedFileStorage.readString(context, SharedFileStorage.TODOS_FILE)
                if (todosByDateStr != null) {
                    try {
                        val byDate = JSONObject(todosByDateStr)
                        val dateKeys = byDate.keys()
                        outer@ while (dateKeys.hasNext()) {
                            val date = dateKeys.next()
                            val todos = byDate.getJSONArray(date)
                            for (i in 0 until todos.length()) {
                                val t = todos.getJSONObject(i)
                                if (t.optString("id") == todoId) {
                                    currentIsDone = t.optBoolean("isDone", false)
                                    break@outer
                                }
                            }
                        }
                    } catch (_: Exception) {}
                }
                beforeMap[todoId] = currentIsDone
            }

            val newObj = JSONObject().apply {
                put("ids", JSONArray().apply { pendingList.forEach { put(it) } })
                put("before", JSONObject().apply { beforeMap.forEach { (k, v) -> put(k, v) } })
            }
            SharedFileStorage.writeString(context, SharedFileStorage.PENDING_FILE, newObj.toString())
            Log.d("ToggleTodoAction", "pending updated: $pendingList, before: $beforeMap")
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

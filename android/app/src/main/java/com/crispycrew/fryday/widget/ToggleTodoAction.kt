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

        // 매 tap 을 log 로 append. cancel-pending 로직 없음.
        // 위젯/앱 표시는 count 파리티 (홀수=flip) 로 판정.
        // A 두 번 = pending=[A,A] = 파리티 0 = 표시상 그대로.
        // drain 은 순서대로 처리 → A×2 = 서버 net no change.
        writeMutex.withLock {
            val raw = SharedFileStorage.readString(context, SharedFileStorage.PENDING_FILE)
            val pendingList = mutableListOf<String>()
            if (raw != null) {
                try {
                    val obj = JSONObject(raw)
                    obj.optJSONArray("ids")?.let { arr ->
                        for (i in 0 until arr.length()) pendingList.add(arr.getString(i))
                    }
                } catch (_: Exception) {}
            }

            pendingList.add(todoId)

            val newObj = JSONObject().apply {
                put("ids", JSONArray().apply { pendingList.forEach { put(it) } })
            }
            SharedFileStorage.writeString(context, SharedFileStorage.PENDING_FILE, newObj.toString())
            Log.d("ToggleTodoAction", "pending appended: $pendingList")
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

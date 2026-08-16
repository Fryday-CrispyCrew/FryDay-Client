package com.crispycrew.fryday.widget

import android.content.Context
import android.util.Log
import androidx.annotation.DrawableRes
import com.crispycrew.fryday.R
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class TodoItem(
    val id: String,
    val title: String,
    val categoryCode: String,
    val isDone: Boolean
)

enum class WidgetState { ERROR, EMPTY, FRYING, FULL }

data class WidgetEntry(
    val dateString: String,
    val doneCount: Int,
    val doingCount: Int,
    val todos: List<TodoItem>,
    val state: WidgetState
)

object WidgetDataReader {
    fun read(context: Context): WidgetEntry {
        val state = readState(context)
        val isLoggedIn = state.optBoolean("isLoggedIn", false)
        val isServerError = state.optBoolean("isServerError", false)
        val isConnected = isLoggedIn && !isServerError

        val dateString = formatDateKorean(Date())

        if (!isConnected) {
            return WidgetEntry(
                dateString = dateString,
                doneCount = 0,
                doingCount = 0,
                todos = emptyList(),
                state = WidgetState.ERROR
            )
        }

        val todayISO = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val pendingIds = readPendingIds(context)
        val todos = readTodosForDate(context, todayISO, pendingIds)
        Log.d("WidgetDataReader", "read: todos=${todos.map { it.id to it.isDone }}")

        val doneCount = todos.count { it.isDone }
        val doingCount = todos.count { !it.isDone }

        val entryState = when {
            todos.isEmpty() -> WidgetState.EMPTY
            doingCount == 0 -> WidgetState.FULL
            else -> WidgetState.FRYING
        }

        return WidgetEntry(
            dateString = dateString,
            doneCount = doneCount,
            doingCount = doingCount,
            todos = todos,
            state = entryState
        )
    }

    private fun formatDateKorean(date: Date): String {
        return SimpleDateFormat("M월 d일 (E)", Locale.KOREAN).format(date)
    }

    private fun readState(context: Context): JSONObject {
        val raw = SharedFileStorage.readString(context, SharedFileStorage.STATE_FILE) ?: return JSONObject()
        return try {
            JSONObject(raw)
        } catch (_: Exception) {
            JSONObject()
        }
    }

    private fun readPendingIds(context: Context): Set<String> {
        val raw = SharedFileStorage.readString(context, SharedFileStorage.PENDING_FILE) ?: return emptySet()
        return try {
            val obj = JSONObject(raw)
            val ids = obj.optJSONArray("ids") ?: return emptySet()
            (0 until ids.length()).map { ids.getString(it) }.toSet()
        } catch (_: Exception) {
            emptySet()
        }
    }

    private fun readTodosForDate(
        context: Context,
        dateISO: String,
        pendingIds: Set<String>
    ): List<TodoItem> {
        val json = SharedFileStorage.readString(context, SharedFileStorage.TODOS_FILE) ?: return emptyList()
        return try {
            val byDate = JSONObject(json)
            if (!byDate.has(dateISO)) return emptyList()
            val arr = byDate.getJSONArray(dateISO)
            (0 until arr.length()).map { i ->
                val o = arr.getJSONObject(i)
                val id = o.getString("id")
                val rawIsDone = o.optBoolean("isDone", false)
                val effectiveIsDone = if (pendingIds.contains(id)) !rawIsDone else rawIsDone
                TodoItem(
                    id = id,
                    title = o.optString("title", ""),
                    categoryCode = o.optString("categoryCode", "OR"),
                    isDone = effectiveIsDone
                )
            }
        } catch (_: Exception) {
            emptyList()
        }
    }
}

object WidgetImages {
    @DrawableRes
    fun smallCharacter(state: WidgetState): Int = when (state) {
        WidgetState.FULL -> R.drawable.small_full
        WidgetState.FRYING -> R.drawable.small_frying
        WidgetState.EMPTY -> R.drawable.small_empty
        WidgetState.ERROR -> 0
    }

    @DrawableRes
    fun mediumCharacter(state: WidgetState): Int = when (state) {
        WidgetState.FULL -> R.drawable.medium_full
        WidgetState.FRYING -> R.drawable.medium_frying
        WidgetState.EMPTY -> R.drawable.medium_empty
        WidgetState.ERROR -> R.drawable.medium_error
    }
}

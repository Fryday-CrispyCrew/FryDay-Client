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
    private const val PREF_NAME = "fryday_widget"
    private const val KEY_IS_LOGGED_IN = "isLoggedIn"
    private const val KEY_IS_SERVER_ERROR = "isServerError"
    private const val KEY_TODOS_BY_DATE = "todosByDateJson"
    private const val KEY_PENDING_TOGGLES = "pendingToggleIds"

    fun read(context: Context): WidgetEntry {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

        val isLoggedIn = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
        val isServerError = prefs.getBoolean(KEY_IS_SERVER_ERROR, false)
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
        val pendingIds = readPendingIds(prefs)
        val todos = readTodosForDate(prefs, todayISO, pendingIds)
        Log.d("WidgetDataReader", "read: todos=${todos.map { it.id to it.isDone }}")

        val doneCount = todos.count { it.isDone }
        val doingCount = todos.count { !it.isDone }

        val state = when {
            todos.isEmpty() -> WidgetState.EMPTY
            doingCount == 0 -> WidgetState.FULL
            else -> WidgetState.FRYING
        }

        return WidgetEntry(
            dateString = dateString,
            doneCount = doneCount,
            doingCount = doingCount,
            todos = todos,
            state = state
        )
    }

    private fun formatDateKorean(date: Date): String {
        return SimpleDateFormat("M월 d일 (E)", Locale.KOREAN).format(date)
    }

    private fun readPendingIds(prefs: android.content.SharedPreferences): Set<String> {
        val raw = prefs.getString(KEY_PENDING_TOGGLES, null) ?: return emptySet()
        return try {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { arr.getString(it) }.toSet()
        } catch (_: Exception) {
            emptySet()
        }
    }

    private fun readTodosForDate(
        prefs: android.content.SharedPreferences,
        dateISO: String,
        pendingIds: Set<String>
    ): List<TodoItem> {
        val json = prefs.getString(KEY_TODOS_BY_DATE, null) ?: return emptyList()
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

package com.crispycrew.fryday.widget

import android.content.Context
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.state.updateAppWidgetState
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

class FrydayWidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val ctx: Context get() = reactApplicationContext

    override fun getName() = "FrydayWidget"

    // -------- state (isLoggedIn / isServerError) --------

    private fun readState(): JSONObject {
        val raw = SharedFileStorage.readString(ctx, SharedFileStorage.STATE_FILE) ?: return JSONObject()
        return try { JSONObject(raw) } catch (_: Exception) { JSONObject() }
    }

    private fun writeState(state: JSONObject) {
        SharedFileStorage.writeString(ctx, SharedFileStorage.STATE_FILE, state.toString())
    }

    // -------- todos --------

    @ReactMethod
    fun syncTodos(json: String, promise: Promise) {
        try {
            val existing = SharedFileStorage.readString(ctx, SharedFileStorage.TODOS_FILE)
            val merged = if (existing.isNullOrEmpty()) json else mergeTodosJson(existing, json)
            SharedFileStorage.writeString(ctx, SharedFileStorage.TODOS_FILE, merged)
            reloadAllWidgets()
            WidgetMidnightUpdateReceiver.scheduleNextMidnight(ctx)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SYNC_TODOS_FAILED", e)
        }
    }

    private fun mergeTodosJson(existingJson: String, incomingJson: String): String {
        return try {
            val existing = JSONObject(existingJson)
            val incoming = JSONObject(incomingJson)
            val keys = incoming.keys()
            while (keys.hasNext()) {
                val date = keys.next()
                existing.put(date, incoming.get(date))
            }
            existing.toString()
        } catch (_: Exception) {
            incomingJson
        }
    }

    @ReactMethod
    fun syncLogin(isLoggedIn: Boolean, promise: Promise) {
        try {
            val state = readState()
            state.put("isLoggedIn", isLoggedIn)
            writeState(state)
            reloadAllWidgets()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SYNC_LOGIN_FAILED", e)
        }
    }

    @ReactMethod
    fun syncServerError(isServerError: Boolean, promise: Promise) {
        try {
            val state = readState()
            state.put("isServerError", isServerError)
            writeState(state)
            reloadAllWidgets()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SYNC_SERVER_ERROR_FAILED", e)
        }
    }

    @ReactMethod
    fun clearForLogout(promise: Promise) {
        try {
            writeState(JSONObject().apply { put("isLoggedIn", false) })
            SharedFileStorage.delete(ctx, SharedFileStorage.TODOS_FILE)
            SharedFileStorage.delete(ctx, SharedFileStorage.PENDING_FILE)
            reloadAllWidgets()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CLEAR_LOGOUT_FAILED", e)
        }
    }

    // -------- pending (widget → app) --------

    private fun readPending(): JSONObject {
        val raw = SharedFileStorage.readString(ctx, SharedFileStorage.PENDING_FILE) ?: return JSONObject()
        return try { JSONObject(raw) } catch (_: Exception) { JSONObject() }
    }

    private fun writePending(ids: JSONArray, before: JSONObject) {
        val obj = JSONObject().apply {
            put("ids", ids)
            put("before", before)
        }
        SharedFileStorage.writeString(ctx, SharedFileStorage.PENDING_FILE, obj.toString())
    }

    @ReactMethod
    fun getPendingToggles(promise: Promise) {
        try {
            val ids = readPending().optJSONArray("ids") ?: JSONArray()
            promise.resolve(ids.toString())
        } catch (e: Exception) {
            promise.reject("GET_PENDING_FAILED", e)
        }
    }

    @ReactMethod
    fun getPendingBeforeStates(promise: Promise) {
        try {
            val before = readPending().optJSONObject("before") ?: JSONObject()
            promise.resolve(before.toString())
        } catch (e: Exception) {
            promise.reject("GET_BEFORE_FAILED", e)
        }
    }

    @ReactMethod
    fun clearPendingToggles(promise: Promise) {
        try {
            SharedFileStorage.delete(ctx, SharedFileStorage.PENDING_FILE)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CLEAR_PENDING_FAILED", e)
        }
    }

    @ReactMethod
    fun setPendingToggles(json: String, promise: Promise) {
        try {
            val cur = readPending()
            val before = cur.optJSONObject("before") ?: JSONObject()
            val newIds = JSONArray(json)
            writePending(newIds, before)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SET_PENDING_FAILED", e)
        }
    }

    @ReactMethod
    fun setPendingBeforeStates(json: String, promise: Promise) {
        try {
            val cur = readPending()
            val ids = cur.optJSONArray("ids") ?: JSONArray()
            val newBefore = JSONObject(json)
            writePending(ids, newBefore)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SET_BEFORE_FAILED", e)
        }
    }

    @ReactMethod
    fun getTodosByDate(promise: Promise) {
        try {
            promise.resolve(SharedFileStorage.readString(ctx, SharedFileStorage.TODOS_FILE))
        } catch (e: Exception) {
            promise.reject("GET_TODOS_FAILED", e)
        }
    }

    @ReactMethod
    fun reloadWidgets(promise: Promise) {
        try {
            reloadAllWidgets()
            WidgetMidnightUpdateReceiver.scheduleNextMidnight(ctx)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("RELOAD_FAILED", e)
        }
    }

    private fun reloadAllWidgets() {
        val context = ctx
        val tickKey = longPreferencesKey("_widgetTick")
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val manager = GlanceAppWidgetManager(context)
                val smallInstance = FrydayWidgetSmall()
                val mediumInstance = FrydayWidgetMediumList()
                val tick = System.currentTimeMillis()
                manager.getGlanceIds(FrydayWidgetSmall::class.java).forEach { id ->
                    updateAppWidgetState(context, id) { p -> p[tickKey] = tick }
                    smallInstance.update(context, id)
                }
                manager.getGlanceIds(FrydayWidgetMediumList::class.java).forEach { id ->
                    updateAppWidgetState(context, id) { p -> p[tickKey] = tick }
                    mediumInstance.update(context, id)
                }
            } catch (_: Exception) {}
        }
    }
}

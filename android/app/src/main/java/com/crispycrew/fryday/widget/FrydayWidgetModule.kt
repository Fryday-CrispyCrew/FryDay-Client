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
import org.json.JSONObject

class FrydayWidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val prefs by lazy {
        reactApplicationContext.getSharedPreferences("fryday_widget", Context.MODE_PRIVATE)
    }

    override fun getName() = "FrydayWidget"

    @ReactMethod
    fun syncTodos(json: String, promise: Promise) {
        try {
            val existing = prefs.getString("todosByDateJson", null)
            val merged = if (existing.isNullOrEmpty()) json else mergeTodosJson(existing, json)
            prefs.edit().putString("todosByDateJson", merged).apply()
            reloadAllWidgets()
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
            prefs.edit().putBoolean("isLoggedIn", isLoggedIn).apply()
            reloadAllWidgets()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SYNC_LOGIN_FAILED", e)
        }
    }

    @ReactMethod
    fun syncServerError(isServerError: Boolean, promise: Promise) {
        try {
            prefs.edit().putBoolean("isServerError", isServerError).apply()
            reloadAllWidgets()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SYNC_SERVER_ERROR_FAILED", e)
        }
    }

    @ReactMethod
    fun clearForLogout(promise: Promise) {
        try {
            prefs.edit()
                .putBoolean("isLoggedIn", false)
                .remove("isServerError")
                .remove("todosByDateJson")
                .remove("pendingToggleIds")
                .apply()
            reloadAllWidgets()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CLEAR_LOGOUT_FAILED", e)
        }
    }

    @ReactMethod
    fun getPendingToggles(promise: Promise) {
        try {
            val json = prefs.getString("pendingToggleIds", null)
            promise.resolve(json)
        } catch (e: Exception) {
            promise.reject("GET_PENDING_FAILED", e)
        }
    }

    @ReactMethod
    fun clearPendingToggles(promise: Promise) {
        try {
            prefs.edit().remove("pendingToggleIds").apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CLEAR_PENDING_FAILED", e)
        }
    }

    @ReactMethod
    fun getTodosByDate(promise: Promise) {
        try {
            val json = prefs.getString("todosByDateJson", null)
            promise.resolve(json)
        } catch (e: Exception) {
            promise.reject("GET_TODOS_FAILED", e)
        }
    }

    @ReactMethod
    fun reloadWidgets(promise: Promise) {
        try {
            reloadAllWidgets()
            WidgetMidnightUpdateReceiver.scheduleNextMidnight(reactApplicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("RELOAD_FAILED", e)
        }
    }

    private fun reloadAllWidgets() {
        val context = reactApplicationContext
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

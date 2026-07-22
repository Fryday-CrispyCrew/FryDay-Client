package com.crispycrew.fryday.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FrydayWidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val prefs by lazy {
        reactApplicationContext.getSharedPreferences("fryday_widget", Context.MODE_PRIVATE)
    }

    override fun getName() = "FrydayWidget"

    @ReactMethod
    fun syncTodos(json: String, promise: Promise) {
        try {
            prefs.edit().putString("todosByDateJson", json).apply()
            reloadAllWidgets()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SYNC_TODOS_FAILED", e)
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
    fun reloadWidgets(promise: Promise) {
        try {
            reloadAllWidgets()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("RELOAD_FAILED", e)
        }
    }

    private fun reloadAllWidgets() {
        val context = reactApplicationContext
        val manager = AppWidgetManager.getInstance(context)
        val kinds = listOf(
            FrydayWidgetSmallReceiver::class.java,
            FrydayWidgetMediumCharReceiver::class.java,
            FrydayWidgetMediumListReceiver::class.java
        )
        for (kind in kinds) {
            val ids = manager.getAppWidgetIds(ComponentName(context, kind))
            if (ids.isNotEmpty()) {
                val intent = Intent(context, kind).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                }
                context.sendBroadcast(intent)
            }
        }
    }
}

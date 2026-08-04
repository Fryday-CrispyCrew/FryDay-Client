package com.crispycrew.fryday.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.state.updateAppWidgetState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Calendar

class WidgetMidnightUpdateReceiver : BroadcastReceiver() {

    companion object {
        private const val REQUEST_CODE = 42001
        private val TICK_KEY = longPreferencesKey("_widgetTick")

        fun scheduleNextMidnight(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            val calendar = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_MONTH, 1)
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 5)
                set(Calendar.MILLISECOND, 0)
            }

            val intent = Intent(context, WidgetMidnightUpdateReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            try {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            } catch (_: Exception) {}
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
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
            } catch (_: Exception) {}

            scheduleNextMidnight(context)
        }
    }
}

package com.crispycrew.fryday.widget

import android.content.Intent
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.action.ActionCallback
import android.content.Context
import androidx.glance.GlanceId
import com.crispycrew.fryday.MainActivity

class OpenAppAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        context.startActivity(intent)
    }
}

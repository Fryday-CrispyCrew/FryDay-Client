package com.crispycrew.fryday.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.ImageProvider
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.crispycrew.fryday.R

class FrydayWidgetMediumList : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact
    override val stateDefinition = androidx.glance.state.PreferencesGlanceStateDefinition

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val state = androidx.glance.currentState<androidx.datastore.preferences.core.Preferences>()
            state[androidx.datastore.preferences.core.longPreferencesKey("_widgetTick")]
            val entry = WidgetDataReader.read(context)
            MediumWidgetContent(entry)
        }
    }
}

@Composable
private fun MediumWidgetContent(entry: WidgetEntry) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ImageProvider(R.drawable.widget_surface_bg))
            .clickable(actionRunCallback<OpenAppAction>())
    ) {
        Column(modifier = GlanceModifier.fillMaxSize().padding(horizontal = 18.dp, vertical = 14.dp)) {
            if (entry.state == WidgetState.ERROR || entry.state == WidgetState.EMPTY) {
                Spacer(modifier = GlanceModifier.height(20.dp))
                Text(
                    text = entry.dateString,
                    style = TextStyle(
                        color = ColorProvider(R.color.gray_500),
                        fontSize = 12.sp
                    )
                )
                Spacer(modifier = GlanceModifier.height(13.dp))
                CenterBowlMessage(state = entry.state)
                Spacer(modifier = GlanceModifier.height(60.dp))
            } else {
                Spacer(modifier = GlanceModifier.height(11.dp))
                Text(
                    text = entry.dateString,
                    style = TextStyle(
                        color = ColorProvider(R.color.gray_500),
                        fontSize = 12.sp
                    )
                )
                Spacer(modifier = GlanceModifier.height(13.dp))
                TodoListGrid(entry.todos, maxItems = 8)
            }
        }
    }
}

class FrydayWidgetMediumListReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FrydayWidgetMediumList()
}

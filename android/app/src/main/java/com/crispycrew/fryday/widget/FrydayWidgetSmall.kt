package com.crispycrew.fryday.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.longPreferencesKey
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
import androidx.glance.currentState
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxHeight
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.crispycrew.fryday.R

class FrydayWidgetSmall : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact
    override val stateDefinition = PreferencesGlanceStateDefinition

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val state = currentState<Preferences>()
            state[longPreferencesKey("_widgetTick")]
            val entry = WidgetDataReader.read(context)
            SmallWidgetContent(entry)
        }
    }
}

@Composable
private fun SmallWidgetContent(entry: WidgetEntry) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ImageProvider(R.drawable.widget_surface_bg))
            .clickable(actionRunCallback<OpenAppAction>())
    ) {
        Column(modifier = GlanceModifier.fillMaxSize().padding(start = 18.dp, end = 0.dp, top = 18.dp, bottom = 18.dp).clickable(actionRunCallback<OpenAppAction>())) {
            Text(
                text = entry.dateString,
                style = TextStyle(
                    color = ColorProvider(R.color.gray_500),
                    fontSize = 12.sp
                ),
                modifier = GlanceModifier.padding(end = 18.dp)
            )
            Spacer(modifier = GlanceModifier.height(13.dp))
            when (entry.state) {
                WidgetState.ERROR, WidgetState.EMPTY -> {
                    Spacer(modifier = GlanceModifier.defaultWeight())
                    Box(modifier = GlanceModifier.fillMaxWidth().padding(end = 18.dp)) {
                        CenterBowlMessage(state = entry.state)
                    }
                    Spacer(modifier = GlanceModifier.defaultWeight())
                }
                else -> AutoSpacedTodoList(entry.todos)
            }
        }
    }
}

@Composable
private fun AutoSpacedTodoList(todos: List<TodoItem>) {
    val list = todos.take(4)
    Column(modifier = GlanceModifier.fillMaxWidth().fillMaxHeight().padding(end = 18.dp)) {
        list.forEachIndexed { i, todo ->
            if (i > 0) Spacer(modifier = GlanceModifier.defaultWeight())
            Box(modifier = GlanceModifier.height(20.dp)) {
                TodoCell(todo)
            }
        }
    }
}

class FrydayWidgetSmallReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FrydayWidgetSmall()

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        WidgetMidnightUpdateReceiver.scheduleNextMidnight(context)
    }
}

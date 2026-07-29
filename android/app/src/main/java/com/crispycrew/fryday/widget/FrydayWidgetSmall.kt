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
import androidx.glance.LocalSize
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.lazy.LazyColumn
import androidx.glance.appwidget.lazy.itemsIndexed
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.currentState
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
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
        Column(modifier = GlanceModifier.fillMaxSize().padding(14.dp)) {
            Spacer(modifier = GlanceModifier.height(6.dp))
            Text(
                text = entry.dateString,
                style = TextStyle(
                    color = ColorProvider(R.color.gray_500),
                    fontSize = 12.sp
                )
            )
            Spacer(modifier = GlanceModifier.height(13.dp))
            when (entry.state) {
                WidgetState.ERROR, WidgetState.EMPTY ->
                    CenterBowlMessage(state = entry.state)
                else -> ScrollableTodoList(entry.todos)
            }
        }
    }
}

@Composable
private fun ScrollableTodoList(todos: List<TodoItem>) {
    val size = LocalSize.current
    val available = (size.height.value - 61f).coerceAtLeast(20f)
    val rowH = 20f
    val fitGap = 16f
    val fitRows = ((available + fitGap) / (rowH + fitGap)).toInt().coerceIn(1, 4)
    val gap = if (fitRows > 1) {
        ((available - fitRows * rowH) / (fitRows - 1)).coerceIn(16f, 22f)
    } else {
        0f
    }
    val listHeight = fitRows * rowH + (fitRows - 1).coerceAtLeast(0) * gap
    LazyColumn(modifier = GlanceModifier.fillMaxWidth().height(listHeight.dp)) {
        itemsIndexed(todos, itemId = { _, it -> it.id.hashCode().toLong() }) { i, todo ->
            Column {
                if (i > 0) Spacer(modifier = GlanceModifier.height(gap.dp))
                Box(modifier = GlanceModifier.height(rowH.dp)) {
                    TodoCell(todo)
                }
            }
        }
    }
}

class FrydayWidgetSmallReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FrydayWidgetSmall()
}

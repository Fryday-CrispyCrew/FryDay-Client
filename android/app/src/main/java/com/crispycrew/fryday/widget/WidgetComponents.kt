package com.crispycrew.fryday.widget

import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.ColorFilter
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.action.actionParametersOf
import androidx.glance.action.clickable
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxHeight
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.crispycrew.fryday.R

@Composable
fun TodoListColumn(todos: List<TodoItem>, maxItems: Int) {
    val list = todos.take(maxItems)
    Column(modifier = GlanceModifier.fillMaxWidth()) {
        list.forEachIndexed { i, todo ->
            if (i > 0) Spacer(modifier = GlanceModifier.height(16.dp))
            TodoCell(todo)
        }
    }
}

@Composable
fun TodoListGrid(todos: List<TodoItem>, maxItems: Int) {
    val rowH = 20f
    val list = todos.take(maxItems)
    val totalRows = maxItems / 2
    Column(modifier = GlanceModifier.fillMaxWidth().fillMaxHeight()) {
        for (rowIdx in 0 until totalRows) {
            if (rowIdx > 0) Spacer(modifier = GlanceModifier.defaultWeight())
            Row(modifier = GlanceModifier.fillMaxWidth().height(rowH.dp)) {
                val leftIdx = rowIdx * 2
                val rightIdx = rowIdx * 2 + 1
                Box(modifier = GlanceModifier.defaultWeight()) {
                    if (leftIdx < list.size) TodoCell(list[leftIdx])
                }
                Spacer(modifier = GlanceModifier.width(12.dp))
                Box(modifier = GlanceModifier.defaultWeight()) {
                    if (rightIdx < list.size) TodoCell(list[rightIdx])
                }
            }
        }
    }
}

@Composable
fun TodoCell(todo: TodoItem) {
    Row(
        modifier = GlanceModifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = todo.title,
            style = TextStyle(
                color = ColorProvider(R.color.gray_text),
                fontSize = 12.sp
            ),
            maxLines = 1,
            modifier = GlanceModifier.defaultWeight()
        )
        Spacer(modifier = GlanceModifier.width(4.dp))
        WidgetCheckBox(todo)
    }
}

@Composable
fun WidgetCheckBox(todo: TodoItem) {
    Log.d("WidgetCheckBox", "render ${todo.id} isDone=${todo.isDone}")
    val drawable = if (todo.isDone) R.drawable.radio_on else R.drawable.radio_off
    val tintColor = if (todo.isDone) {
        ColorProvider(AppColor.categoryColor(todo.categoryCode))
    } else {
        ColorProvider(R.color.gray_200)
    }
    Box(
        modifier = GlanceModifier
            .size(20.dp)
            .clickable(
                actionRunCallback<ToggleTodoAction>(
                    actionParametersOf(ToggleTodoAction.todoIdKey to todo.id)
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Image(
            provider = ImageProvider(drawable),
            contentDescription = null,
            colorFilter = ColorFilter.tint(tintColor),
            modifier = GlanceModifier.size(20.dp)
        )
    }
}

@Composable
fun CenterBowlMessage(state: WidgetState) {
    val message = when (state) {
        WidgetState.ERROR -> "연결 상태를 확인해 주세요."
        WidgetState.EMPTY -> "아직 투두가 없어요."
        else -> ""
    }
    Column(
        modifier = GlanceModifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Image(
            provider = ImageProvider(R.drawable.medium_bowl),
            contentDescription = null,
            modifier = GlanceModifier.size(40.dp)
        )
        Spacer(modifier = GlanceModifier.height(8.dp))
        Text(
            text = message,
            style = TextStyle(
                color = ColorProvider(R.color.gray_500),
                fontSize = 12.sp,
                textAlign = TextAlign.Center
            )
        )
    }
}


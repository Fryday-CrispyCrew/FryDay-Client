package com.crispycrew.fryday.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
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

private val MEDIUM_MAX_HEIGHT = 180.dp

class FrydayWidgetMediumList : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val entry = WidgetDataReader.read(context)
        provideContent {
            MediumListContent(entry)
        }
    }
}

@Composable
private fun MediumListContent(entry: WidgetEntry) {
    val size = LocalSize.current
    val boxHeight = minOf(size.height, MEDIUM_MAX_HEIGHT)

    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(androidx.glance.color.ColorProvider(day = Color.Transparent, night = Color.Transparent)),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = GlanceModifier
                .fillMaxWidth()
                .height(boxHeight)
                .background(ImageProvider(R.drawable.widget_surface_bg))
        ) {
            when (entry.state) {
                WidgetState.ERROR -> ListErrorView(entry.dateString)
                WidgetState.EMPTY -> ListEmptyView(entry.dateString)
                else -> ListContentView(entry)
            }
        }
    }
}

@Composable
private fun ListContentView(entry: WidgetEntry) {
    Column(modifier = GlanceModifier.fillMaxSize().padding(18.dp)) {
        Text(
            text = entry.dateString,
            style = TextStyle(
                color = ColorProvider(R.color.gray_500),
                fontSize = 12.sp
            )
        )
        Spacer(modifier = GlanceModifier.height(20.dp))
        val todos = entry.todos.take(6)
        val rows = todos.chunked(2)
        rows.forEachIndexed { rowIdx, pair ->
            if (rowIdx > 0) Spacer(modifier = GlanceModifier.height(16.dp))
            Row(modifier = GlanceModifier.fillMaxWidth()) {
                pair.forEachIndexed { colIdx, todo ->
                    if (colIdx > 0) Spacer(modifier = GlanceModifier.width(12.dp))
                    ListTodoCell(todo, GlanceModifier.defaultWeight())
                }
                if (pair.size == 1) {
                    Spacer(modifier = GlanceModifier.width(12.dp))
                    Box(modifier = GlanceModifier.defaultWeight()) {}
                }
            }
        }
    }
}

@Composable
private fun ListTodoCell(todo: TodoItem, modifier: GlanceModifier) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = truncate(todo.title, 13),
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
private fun ListEmptyView(dateString: String) {
    Column(modifier = GlanceModifier.fillMaxSize().padding(18.dp)) {
        Text(
            text = dateString,
            style = TextStyle(
                color = ColorProvider(R.color.gray_500),
                fontSize = 12.sp
            )
        )
        Column(
            modifier = GlanceModifier.defaultWeight().fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                provider = ImageProvider(R.drawable.medium_bowl),
                contentDescription = null,
                modifier = GlanceModifier.size(40.dp)
            )
            Spacer(modifier = GlanceModifier.height(8.dp))
            Text(
                text = "아직 튀긴 투두가 없어요.",
                style = TextStyle(
                    color = ColorProvider(R.color.gray_500),
                    fontSize = 12.sp
                )
            )
            Text(
                text = "위젯을 눌러 투두를 추가해 주세요!",
                style = TextStyle(
                    color = ColorProvider(R.color.gray_500),
                    fontSize = 12.sp
                )
            )
        }
    }
}

@Composable
private fun ListErrorView(dateString: String) {
    Column(modifier = GlanceModifier.fillMaxSize().padding(18.dp)) {
        Text(
            text = dateString,
            style = TextStyle(
                color = ColorProvider(R.color.gray_500),
                fontSize = 12.sp
            )
        )
        Column(
            modifier = GlanceModifier.defaultWeight().fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                provider = ImageProvider(R.drawable.medium_bowl),
                contentDescription = null,
                modifier = GlanceModifier.size(40.dp)
            )
            Spacer(modifier = GlanceModifier.height(8.dp))
            Text(
                text = "앱을 열어\n연결 상태를 확인해 주세요.",
                style = TextStyle(
                    color = ColorProvider(R.color.gray_500),
                    fontSize = 12.sp,
                    textAlign = TextAlign.Center
                )
            )
        }
    }
}

private fun truncate(text: String, max: Int): String =
    if (text.length <= max) text else text.take(max) + "..."

class FrydayWidgetMediumListReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FrydayWidgetMediumList()
}

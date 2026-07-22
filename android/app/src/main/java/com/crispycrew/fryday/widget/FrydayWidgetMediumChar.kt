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

class FrydayWidgetMediumChar : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val entry = WidgetDataReader.read(context)
        provideContent {
            MediumCharContent(entry)
        }
    }
}

@Composable
private fun MediumCharContent(entry: WidgetEntry) {
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
                WidgetState.ERROR -> MediumCharErrorView(entry.dateString)
                WidgetState.EMPTY -> MediumCharEmptyView(entry.dateString)
                else -> MediumCharFullView(entry)
            }
        }
    }
}

@Composable
private fun MediumCharFullView(entry: WidgetEntry) {
    val size = LocalSize.current
    val boxHeight = minOf(size.height, MEDIUM_MAX_HEIGHT)
    val charSize = boxHeight * 0.9f

    Row(modifier = GlanceModifier.fillMaxSize()) {
        Column(
            modifier = GlanceModifier
                .defaultWeight()
                .padding(top = 18.dp, start = 18.dp, end = 8.dp, bottom = 18.dp)
        ) {
            entry.todos.take(4).forEachIndexed { i, todo ->
                if (i > 0) Spacer(modifier = GlanceModifier.height(16.dp))
                TodoRow(todo)
            }
        }
        Box(
            modifier = GlanceModifier.fillMaxSize().defaultWeight(),
            contentAlignment = Alignment.BottomEnd
        ) {
            Image(
                provider = ImageProvider(WidgetImages.mediumCharacter(entry.state)),
                contentDescription = null,
                modifier = GlanceModifier.size(charSize)
            )
            Box(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .padding(top = 18.dp, end = 18.dp),
                contentAlignment = Alignment.TopEnd
            ) {
                WidgetHeader(
                    dateString = entry.dateString,
                    doneCount = entry.doneCount,
                    doingCount = entry.doingCount
                )
            }
        }
    }
}

@Composable
private fun TodoRow(todo: TodoItem) {
    Row(verticalAlignment = Alignment.CenterVertically) {
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
private fun MediumCharEmptyView(dateString: String) {
    Box(modifier = GlanceModifier.fillMaxSize()) {
        Image(
            provider = ImageProvider(R.drawable.medium_empty),
            contentDescription = null,
            modifier = GlanceModifier.fillMaxSize()
        )
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .padding(top = 18.dp, start = 18.dp)
        ) {
            Text(
                text = "아직 튀긴 투두가 없어요.",
                style = TextStyle(
                    color = ColorProvider(R.color.gray_700),
                    fontSize = 12.sp
                )
            )
            Text(
                text = "위젯을 눌러 투두를 추가해 주세요!",
                style = TextStyle(
                    color = ColorProvider(R.color.gray_700),
                    fontSize = 12.sp
                )
            )
        }
        Box(
            modifier = GlanceModifier
                .fillMaxSize()
                .padding(top = 18.dp, end = 18.dp),
            contentAlignment = Alignment.TopEnd
        ) {
            Text(
                text = dateString,
                style = TextStyle(
                    color = ColorProvider(R.color.gray_500),
                    fontSize = 12.sp
                )
            )
        }
    }
}

@Composable
private fun MediumCharErrorView(dateString: String) {
    val size = LocalSize.current
    val boxHeight = minOf(size.height, MEDIUM_MAX_HEIGHT)
    val charSize = boxHeight * 0.9f

    Row(modifier = GlanceModifier.fillMaxSize()) {
        Column(
            modifier = GlanceModifier
                .defaultWeight()
                .padding(top = 18.dp, start = 18.dp)
        ) {
            Text(
                text = "앱을 열어\n연결 상태를 확인해 주세요.",
                style = TextStyle(
                    color = ColorProvider(R.color.gray_500),
                    fontSize = 12.sp
                )
            )
        }
        Box(
            modifier = GlanceModifier.fillMaxSize().defaultWeight(),
            contentAlignment = Alignment.BottomEnd
        ) {
            Image(
                provider = ImageProvider(R.drawable.medium_error),
                contentDescription = null,
                modifier = GlanceModifier.size(charSize)
            )
            Box(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .padding(top = 18.dp, end = 18.dp),
                contentAlignment = Alignment.TopEnd
            ) {
                Text(
                    text = dateString,
                    style = TextStyle(
                        color = ColorProvider(R.color.gray_500),
                        fontSize = 12.sp
                    )
                )
            }
        }
    }
}

private fun truncate(text: String, max: Int): String =
    if (text.length <= max) text else text.take(max) + "..."

class FrydayWidgetMediumCharReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FrydayWidgetMediumChar()
}

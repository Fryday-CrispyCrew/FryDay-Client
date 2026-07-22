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
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.crispycrew.fryday.R

// no fixed size — computed from LocalSize at runtime

class FrydayWidgetSmall : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val entry = WidgetDataReader.read(context)
        provideContent {
            SmallWidgetContent(entry)
        }
    }
}

@Composable
private fun SmallWidgetContent(entry: WidgetEntry) {
    val size = LocalSize.current
    val squareSize = minOf(size.width, size.height)

    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(androidx.glance.color.ColorProvider(day = Color.Transparent, night = Color.Transparent))
            .clickable(actionRunCallback<OpenAppAction>()),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = GlanceModifier
                .size(squareSize)
                .background(ImageProvider(R.drawable.widget_surface_bg))
        ) {
            when (entry.state) {
                WidgetState.ERROR -> SmallErrorView(entry.dateString)
                else -> SmallContentView(entry)
            }
        }
    }
}

@Composable
private fun SmallContentView(entry: WidgetEntry) {
    Box(modifier = GlanceModifier.fillMaxSize()) {
        Image(
            provider = ImageProvider(WidgetImages.smallCharacter(entry.state)),
            contentDescription = null,
            modifier = GlanceModifier.fillMaxSize()
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

@Composable
private fun SmallErrorView(dateString: String) {
    Box(modifier = GlanceModifier.fillMaxSize().padding(18.dp)) {
        Box(
            modifier = GlanceModifier.fillMaxWidth(),
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
        Box(
            modifier = GlanceModifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
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

class FrydayWidgetSmallReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FrydayWidgetSmall()
}

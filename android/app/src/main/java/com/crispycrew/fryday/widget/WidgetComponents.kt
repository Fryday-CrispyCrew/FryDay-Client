package com.crispycrew.fryday.widget

import androidx.compose.runtime.Composable
import androidx.glance.ColorFilter
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.height
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.dp
import com.crispycrew.fryday.R

@Composable
fun WidgetHeader(dateString: String, doneCount: Int, doingCount: Int) {
    Column(horizontalAlignment = Alignment.End) {
        Text(
            text = dateString,
            style = TextStyle(
                color = ColorProvider(R.color.gray_500),
                fontSize = 12.sp
            )
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Image(
                provider = ImageProvider(R.drawable.icon_done),
                contentDescription = null,
                modifier = GlanceModifier.size(16.dp)
            )
            Spacer(modifier = GlanceModifier.width(4.dp))
            Text(
                text = "$doneCount",
                style = TextStyle(
                    color = ColorProvider(R.color.category_or),
                    fontSize = 12.sp
                )
            )
            Spacer(modifier = GlanceModifier.width(8.dp))
            Image(
                provider = ImageProvider(R.drawable.icon_doing),
                contentDescription = null,
                modifier = GlanceModifier.size(16.dp)
            )
            Spacer(modifier = GlanceModifier.width(4.dp))
            Text(
                text = "$doingCount",
                style = TextStyle(
                    color = ColorProvider(R.color.gray_700),
                    fontSize = 12.sp
                )
            )
        }
    }
}

@Composable
fun WidgetCheckBox(todo: TodoItem) {
    val drawable = if (todo.isDone) R.drawable.radio_on else R.drawable.radio_off
    val tintColor = if (todo.isDone) {
        ColorProvider(AppColor.categoryColor(todo.categoryCode))
    } else {
        ColorProvider(R.color.gray_200)
    }
    Image(
        provider = ImageProvider(drawable),
        contentDescription = null,
        colorFilter = ColorFilter.tint(tintColor),
        modifier = GlanceModifier.size(20.dp)
    )
}

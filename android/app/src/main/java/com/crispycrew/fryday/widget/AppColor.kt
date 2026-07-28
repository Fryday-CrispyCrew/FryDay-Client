package com.crispycrew.fryday.widget

import androidx.annotation.ColorRes
import com.crispycrew.fryday.R

object AppColor {

    @ColorRes
    fun categoryColor(code: String): Int = when (code.uppercase()) {
        "OR" -> R.color.category_or
        "BR" -> R.color.category_br
        "LG" -> R.color.category_lg
        "CB" -> R.color.category_cb
        "DP" -> R.color.category_dp
        "MT" -> R.color.category_mt
        "VL" -> R.color.category_vl
        "PK" -> R.color.category_pk
        "MB" -> R.color.category_mb
        else -> R.color.category_or
    }
}

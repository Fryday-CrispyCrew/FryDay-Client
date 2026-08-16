package com.crispycrew.fryday.widget

import android.content.Context
import java.io.File

// filesDir 안의 파일을 atomic 하게 read/write.
// SharedPreferences 의 in-memory 캐시 stale 이슈 회피용.
// 파일 시스템은 커널 매개 → 어느 컴포넌트(위젯 receiver / app) 에서 read 하든 최신 값 보장.
object SharedFileStorage {
    const val PENDING_FILE = "widget-pending.json"
    const val TODOS_FILE = "widget-todos.json"
    const val STATE_FILE = "widget-state.json"

    // 프로세스 내 read-modify-write race 방지용 lock (Mutex 대체 - 동기 lock)
    private val lock = Any()

    private fun file(context: Context, name: String): File {
        return File(context.filesDir, name)
    }

    fun readString(context: Context, name: String): String? {
        synchronized(lock) {
            val f = file(context, name)
            if (!f.exists()) return null
            return try {
                f.readText(Charsets.UTF_8)
            } catch (_: Exception) {
                null
            }
        }
    }

    fun writeString(context: Context, name: String, contents: String): Boolean {
        synchronized(lock) {
            val target = file(context, name)
            val tmp = File(context.filesDir, "$name.tmp")
            return try {
                tmp.writeText(contents, Charsets.UTF_8)
                // atomic rename
                if (target.exists()) target.delete()
                tmp.renameTo(target)
            } catch (_: Exception) {
                tmp.delete()
                false
            }
        }
    }

    fun delete(context: Context, name: String): Boolean {
        synchronized(lock) {
            val f = file(context, name)
            return if (f.exists()) f.delete() else true
        }
    }
}

import WidgetKit
import Foundation

// 위젯에 표시할 투두 1건
struct TodoItem: Identifiable {
    let id: String             // 백엔드 투두 ID (Intent에서 사용)
    let title: String
    let categoryCode: String   // 예: "OR", "BR", "LG" 등 — 백엔드에서 내려오는 카테고리 코드
    let isDone: Bool           // 완료 여부 (토글용)
}

struct TodoEntry: TimelineEntry {
    let date: Date
    let dateString: String
    let doneCount: Int
    let doingCount: Int
    let isConnected: Bool
    let todos: [TodoItem]

    var state: WidgetState {
        if !isConnected { return .error }
        if doneCount == 0 && doingCount == 0 { return .empty }
        if doingCount > 0 { return .frying }
        return .full
    }
}

enum WidgetState {
    case full
    case frying
    case empty
    case error
}

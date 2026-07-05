import WidgetKit
import Foundation

// 위젯에 표시할 투두 1건
struct TodoItem: Identifiable {
    let id = UUID()
    let title: String
    let categoryCode: String   // 예: "OR", "BR", "LG" 등 — 백엔드에서 내려오는 카테고리 코드
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

import WidgetKit
import Foundation

struct TodoEntry: TimelineEntry {
    let date: Date
    let dateString: String
    let doneCount: Int
    let doingCount: Int
    let isConnected: Bool

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

import WidgetKit
import SwiftUI

struct TodoProvider: TimelineProvider {
    private let appGroupID = "group.com.fryday.shared"

    func placeholder(in context: Context) -> TodoEntry {
        TodoEntry(
            date: Date(),
            dateString: "1월 1일 (수)",
            doneCount: 10,
            doingCount: 0,
            isConnected: true
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (TodoEntry) -> Void) {
        completion(makeEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TodoEntry>) -> Void) {
        // 15분마다 새로고침
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        completion(Timeline(entries: [makeEntry()], policy: .after(next)))
    }

    private func makeEntry() -> TodoEntry {
        let defaults = UserDefaults(suiteName: appGroupID)

        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "ko_KR")
        fmt.dateFormat = "M월 d일 (E)"

        // isLoggedIn 키가 명시적으로 false일 때만 disconnected
        // 키가 없으면 기본 connected
        let isConnected: Bool = {
            guard let d = defaults, d.object(forKey: "isLoggedIn") != nil else {
                return true
            }
            return d.bool(forKey: "isLoggedIn")
        }()

        return TodoEntry(
            date: Date(),
            dateString: fmt.string(from: Date()),
            doneCount: 13,
            doingCount: 0,
            isConnected: true
        )
    }
}

@main
struct FrydayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FrydayWidget", provider: TodoProvider()) { entry in
            SmallWidgetView(entry: entry)
        }
        .configurationDisplayName("FryDay")
        .description("오늘의 투두를 확인해요")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews (4가지 상태)

#Preview("Full", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(
        date: Date(),
        dateString: "1월 1일 (수)",
        doneCount: 10,
        doingCount: 0,
        isConnected: true
    )
}

#Preview("Frying", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(
        date: Date(),
        dateString: "1월 1일 (수)",
        doneCount: 0,
        doingCount: 10,
        isConnected: true
    )
}

#Preview("Empty", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(
        date: Date(),
        dateString: "1월 1일 (수)",
        doneCount: 0,
        doingCount: 0,
        isConnected: true
    )
}

#Preview("Error", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(
        date: Date(),
        dateString: "1월 1일 (수)",
        doneCount: 0,
        doingCount: 0,
        isConnected: false
    )
}

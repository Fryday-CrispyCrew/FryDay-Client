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
            isConnected: true,
            todos: TodoProvider.previewTodos
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
            doneCount: 4,
            doingCount: 0,
            isConnected: true,
            todos: TodoProvider.previewTodos
        )
    }

    // 임시 프리뷰용 투두 (백엔드 연동 전까지)
    static let previewTodos: [TodoItem] = [
        TodoItem(title: "연우님 기획 차력쇼 감상", categoryCode: "OR"),
        TodoItem(title: "연우님 기획 차력쇼 감상", categoryCode: "BR"),
        TodoItem(title: "연우님 기획 차력쇼 감상", categoryCode: "PK"),
        TodoItem(title: "연우님 기획 차력쇼 감상", categoryCode: "MT"),
    ]
}

// 위젯 크기별 뷰 분기
struct FrydayWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: TodoEntry

    var body: some View {
        switch family {
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

@main
struct FrydayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FrydayWidget", provider: TodoProvider()) { entry in
            FrydayWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("FryDay")
        .description("오늘의 투두를 확인해요")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Small Previews (4가지 상태)

#Preview("Small · Full", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "1월 1일 (수)", doneCount: 10, doingCount: 0, isConnected: true, todos: TodoProvider.previewTodos)
}

#Preview("Small · Frying", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "1월 1일 (수)", doneCount: 0, doingCount: 10, isConnected: true, todos: [])
}

#Preview("Small · Empty", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "1월 1일 (수)", doneCount: 0, doingCount: 0, isConnected: true, todos: [])
}

#Preview("Small · Error", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "1월 1일 (수)", doneCount: 0, doingCount: 0, isConnected: false, todos: [])
}

// MARK: - Medium Previews (3가지 상태)

#Preview("Medium · Full", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 10, doingCount: 0, isConnected: true, todos: TodoProvider.previewTodos)
}

#Preview("Medium · Empty", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 0, doingCount: 0, isConnected: true, todos: [])
}

#Preview("Medium · Error", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 0, doingCount: 0, isConnected: false, todos: [])
}

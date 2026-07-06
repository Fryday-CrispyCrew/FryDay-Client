import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Provider (AppIntent 기반, 하나로 통합)

struct TodoProvider: AppIntentTimelineProvider {
    typealias Entry = TodoEntry
    typealias Intent = FrydayConfigIntent

    func placeholder(in context: Context) -> TodoEntry {
        Self.makeEntry(style: .character)
    }

    func snapshot(for configuration: FrydayConfigIntent, in context: Context) async -> TodoEntry {
        Self.makeEntry(style: configuration.style)
    }

    func timeline(for configuration: FrydayConfigIntent, in context: Context) async -> Timeline<TodoEntry> {
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        return Timeline(entries: [Self.makeEntry(style: configuration.style)], policy: .after(next))
    }

    private struct TodoDTO: Decodable {
        let id: String
        let title: String
        let categoryCode: String
        let isDone: Bool
    }

    static func makeEntry(style: WidgetStyle) -> TodoEntry {
        let appGroupID = "group.com.fryday.shared"
        let defaults = UserDefaults(suiteName: appGroupID)

        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "ko_KR")
        fmt.dateFormat = "M월 d일 (E)"

        let isoFmt = DateFormatter()
        isoFmt.dateFormat = "yyyy-MM-dd"
        let todayISO = isoFmt.string(from: Date())

        let isConnected: Bool = {
            guard let d = defaults, d.object(forKey: "isLoggedIn") != nil else {
                return true
            }
            return d.bool(forKey: "isLoggedIn")
        }()

        let pendingToggleIds: Set<String> = {
            guard let jsonString = defaults?.string(forKey: "pendingToggleIds"),
                  let data = jsonString.data(using: .utf8),
                  let arr = try? JSONDecoder().decode([String].self, from: data) else {
                return []
            }
            return Set(arr)
        }()

        let syncedDate = defaults?.string(forKey: "syncedDate")
        let isTodayData = (syncedDate == todayISO)

        var todos: [TodoItem] = []
        if isTodayData,
           let json = defaults?.string(forKey: "todosJson"),
           let data = json.data(using: .utf8),
           let dtos = try? JSONDecoder().decode([TodoDTO].self, from: data) {
            todos = dtos.map { dto in
                let isDone = pendingToggleIds.contains(dto.id) ? !dto.isDone : dto.isDone
                return TodoItem(id: dto.id, title: dto.title, categoryCode: dto.categoryCode, isDone: isDone)
            }
        }

        let doneCount = todos.filter { $0.isDone }.count
        let doingCount = todos.filter { !$0.isDone }.count

        return TodoEntry(
            date: Date(),
            dateString: fmt.string(from: Date()),
            doneCount: doneCount,
            doingCount: doingCount,
            isConnected: isConnected,
            todos: todos,
            style: style
        )
    }

    static let previewTodos: [TodoItem] = [
        TodoItem(id: "todo-1", title: "연우님 기획 차력쇼 감상", categoryCode: "OR", isDone: false),
        TodoItem(id: "todo-2", title: "연우님 기획 차력쇼 감상", categoryCode: "BR", isDone: false),
        TodoItem(id: "todo-3", title: "연우님 기획 차력쇼 감상", categoryCode: "PK", isDone: false),
        TodoItem(id: "todo-4", title: "연우님 기획 차력쇼 감상", categoryCode: "MT", isDone: false),
        TodoItem(id: "todo-5", title: "연우님 기획 차력쇼 감상", categoryCode: "LG", isDone: false),
        TodoItem(id: "todo-6", title: "연우님 기획 차력쇼 감상", categoryCode: "CB", isDone: false),
    ]
}

// MARK: - Entry View — 크기 + 스타일 분기

struct FrydayWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: TodoEntry

    var body: some View {
        switch family {
        case .systemMedium:
            switch entry.style {
            case .character:
                MediumWidgetView(entry: entry)
            case .list:
                MediumTodoListView(entry: entry)
            }
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget (단 하나) — Small + Medium 지원, Medium은 편집으로 스타일 전환

@main
struct FrydayWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "FrydayWidget",
            intent: FrydayConfigIntent.self,
            provider: TodoProvider()
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("FryDay")
        .description("오늘의 투두를 확인해요")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview("Small · Full", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "1월 1일 (수)", doneCount: 10, doingCount: 0, isConnected: true, todos: TodoProvider.previewTodos)
}

#Preview("Medium 캐릭터형", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 0, doingCount: 4, isConnected: true, todos: Array(TodoProvider.previewTodos.prefix(4)), style: .character)
}

#Preview("Medium 리스트형", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoProvider.previewTodos, style: .list)
}

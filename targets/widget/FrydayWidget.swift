import WidgetKit
import SwiftUI
import AppIntents

// MARK: - 공용 Entry 생성 로직

enum TodoEntryBuilder {
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

        let isLoggedIn = defaults?.bool(forKey: "isLoggedIn") ?? false
        let isServerError = defaults?.bool(forKey: "isServerError") ?? false
        let isConnected = isLoggedIn && !isServerError

        let pendingToggleIds: Set<String> = {
            guard let jsonString = defaults?.string(forKey: "pendingToggleIds"),
                  let data = jsonString.data(using: .utf8),
                  let arr = try? JSONDecoder().decode([String].self, from: data) else {
                return []
            }
            return Set(arr)
        }()

        var todos: [TodoItem] = []
        if let json = defaults?.string(forKey: "todosByDateJson"),
           let data = json.data(using: .utf8),
           let byDate = try? JSONDecoder().decode([String: [TodoDTO]].self, from: data),
           let dtos = byDate[todayISO] {
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

    // App Group을 읽지 않는 즉시 반환 placeholder (Error 상태로 실제 UI 표시)
    static func staticPlaceholder(style: WidgetStyle) -> TodoEntry {
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "ko_KR")
        fmt.dateFormat = "M월 d일 (E)"
        return TodoEntry(
            date: Date(),
            dateString: fmt.string(from: Date()),
            doneCount: 0,
            doingCount: 0,
            isConnected: false,
            todos: [],
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

// MARK: - Providers

struct SmallProvider: TimelineProvider {
    func placeholder(in context: Context) -> TodoEntry {
        TodoEntryBuilder.staticPlaceholder(style: .character)
    }

    func getSnapshot(in context: Context, completion: @escaping (TodoEntry) -> Void) {
        completion(TodoEntryBuilder.makeEntry(style: .character))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TodoEntry>) -> Void) {
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        completion(Timeline(entries: [TodoEntryBuilder.makeEntry(style: .character)], policy: .after(next)))
    }
}

struct MediumCharProvider: AppIntentTimelineProvider {
    typealias Entry = TodoEntry
    typealias Intent = FrydayCharConfigIntent

    func placeholder(in context: Context) -> TodoEntry {
        TodoEntryBuilder.staticPlaceholder(style: .character)
    }

    func snapshot(for configuration: FrydayCharConfigIntent, in context: Context) async -> TodoEntry {
        TodoEntryBuilder.makeEntry(style: configuration.style)
    }

    func timeline(for configuration: FrydayCharConfigIntent, in context: Context) async -> Timeline<TodoEntry> {
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        return Timeline(entries: [TodoEntryBuilder.makeEntry(style: configuration.style)], policy: .after(next))
    }
}

struct MediumListProvider: AppIntentTimelineProvider {
    typealias Entry = TodoEntry
    typealias Intent = FrydayListConfigIntent

    func placeholder(in context: Context) -> TodoEntry {
        TodoEntryBuilder.staticPlaceholder(style: .list)
    }

    func snapshot(for configuration: FrydayListConfigIntent, in context: Context) async -> TodoEntry {
        TodoEntryBuilder.makeEntry(style: configuration.style)
    }

    func timeline(for configuration: FrydayListConfigIntent, in context: Context) async -> Timeline<TodoEntry> {
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        return Timeline(entries: [TodoEntryBuilder.makeEntry(style: configuration.style)], policy: .after(next))
    }
}

// MARK: - Entry View

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

// MARK: - Widgets (3개)

struct FrydayWidgetSmall: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "FrydayWidgetSmall",
            provider: SmallProvider()
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay")
        .description("오늘의 투두를 확인해요")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct FrydayWidgetMediumChar: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "FrydayWidgetMediumChar",
            intent: FrydayCharConfigIntent.self,
            provider: MediumCharProvider()
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay 캐릭터형")
        .description("캐릭터와 함께 오늘의 투두를 확인해요")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct FrydayWidgetMediumList: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "FrydayWidgetMediumList",
            intent: FrydayListConfigIntent.self,
            provider: MediumListProvider()
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay 리스트형")
        .description("최대 6개의 투두를 리스트로 확인해요")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Bundle (3개 위젯을 하나의 extension에서 노출)

@main
struct FrydayWidgetBundle: WidgetBundle {
    var body: some Widget {
        FrydayWidgetSmall()
        FrydayWidgetMediumChar()
        FrydayWidgetMediumList()
    }
}

// MARK: - Previews

#Preview("Small · Full", as: .systemSmall) {
    FrydayWidgetSmall()
} timeline: {
    TodoEntry(date: Date(), dateString: "1월 1일 (수)", doneCount: 10, doingCount: 0, isConnected: true, todos: TodoEntryBuilder.previewTodos)
}

#Preview("Medium 캐릭터형", as: .systemMedium) {
    FrydayWidgetMediumChar()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 0, doingCount: 4, isConnected: true, todos: Array(TodoEntryBuilder.previewTodos.prefix(4)), style: .character)
}

#Preview("Medium 리스트형", as: .systemMedium) {
    FrydayWidgetMediumList()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoEntryBuilder.previewTodos, style: .list)
}

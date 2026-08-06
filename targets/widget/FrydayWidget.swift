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

    static func makeEntry(style: WidgetStyle, forDate date: Date = Date()) -> TodoEntry {
        let appGroupID = "group.com.fryday.shared"
        let defaults = UserDefaults(suiteName: appGroupID)

        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "ko_KR")
        fmt.dateFormat = "M월 d일 (E)"

        let isoFmt = DateFormatter()
        isoFmt.dateFormat = "yyyy-MM-dd"
        let dateISO = isoFmt.string(from: date)

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
           let dtos = byDate[dateISO] {
            todos = dtos.map { dto in
                let isDone = pendingToggleIds.contains(dto.id) ? !dto.isDone : dto.isDone
                return TodoItem(id: dto.id, title: dto.title, categoryCode: dto.categoryCode, isDone: isDone)
            }
        }

        let doneCount = todos.filter { $0.isDone }.count
        let doingCount = todos.filter { !$0.isDone }.count

        return TodoEntry(
            date: date,
            dateString: fmt.string(from: date),
            doneCount: doneCount,
            doingCount: doingCount,
            isConnected: isConnected,
            todos: todos,
            style: style
        )
    }

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

    static func previewSample(style: WidgetStyle) -> TodoEntry {
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "ko_KR")
        fmt.dateFormat = "M월 d일 (E)"
        let sample = style == .list ? previewTodos : Array(previewTodos.prefix(4))
        return TodoEntry(
            date: Date(),
            dateString: fmt.string(from: Date()),
            doneCount: 0,
            doingCount: sample.count,
            isConnected: true,
            todos: sample,
            style: style
        )
    }

    static let previewTodos: [TodoItem] = [
        TodoItem(id: "todo-1", title: "매일 물 2L 마시기", categoryCode: "OR", isDone: false),
        TodoItem(id: "todo-2", title: "영양제 먹기", categoryCode: "BR", isDone: false),
        TodoItem(id: "todo-3", title: "뉴스 확인하기", categoryCode: "PK", isDone: false),
        TodoItem(id: "todo-4", title: "스트레칭 하기", categoryCode: "MT", isDone: false),
        TodoItem(id: "todo-5", title: "환기 시키기", categoryCode: "LG", isDone: false),
        TodoItem(id: "todo-6", title: "요리 책 2장 읽기", categoryCode: "CB", isDone: false),
    ]
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

// MARK: - Small — StaticConfiguration (single kind)

struct SmallStaticProvider: TimelineProvider {
    func placeholder(in context: Context) -> TodoEntry {
        TodoEntryBuilder.staticPlaceholder(style: .character)
    }

    func getSnapshot(in context: Context, completion: @escaping (TodoEntry) -> Void) {
        if context.isPreview {
            completion(TodoEntryBuilder.previewSample(style: .character))
            return
        }
        completion(TodoEntryBuilder.makeEntry(style: .character))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TodoEntry>) -> Void) {
        let now = Date()
        let calendar = Calendar.current

        var entries: [TodoEntry] = [
            TodoEntryBuilder.makeEntry(style: .character, forDate: now)
        ]
        for i in 1..<7 {
            let midnight = calendar.startOfDay(for: now.addingTimeInterval(Double(i) * 86400))
            entries.append(TodoEntryBuilder.makeEntry(style: .character, forDate: midnight))
        }

        let nextRefresh = calendar.startOfDay(for: now.addingTimeInterval(7 * 86400))
        completion(Timeline(entries: entries, policy: .after(nextRefresh)))
    }
}

struct FrydayWidgetSmall: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "FrydayWidgetSmall",
            provider: SmallStaticProvider()
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay")
        .description("오늘의 투두 개수와 완료 현황을 FryDay의 튀김과 함께 확인하세요.")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

// MARK: - Medium — AppIntentConfiguration (single kind, style configurable)

struct MediumIntentProvider: AppIntentTimelineProvider {
    typealias Intent = FrydayConfigIntent
    typealias Entry = TodoEntry

    func placeholder(in context: Context) -> TodoEntry {
        TodoEntryBuilder.staticPlaceholder(style: .character)
    }

    func snapshot(for configuration: FrydayConfigIntent, in context: Context) async -> TodoEntry {
        if context.isPreview {
            return TodoEntryBuilder.previewSample(style: configuration.style)
        }
        return TodoEntryBuilder.makeEntry(style: configuration.style)
    }

    func timeline(for configuration: FrydayConfigIntent, in context: Context) async -> Timeline<TodoEntry> {
        let now = Date()
        let calendar = Calendar.current

        var entries: [TodoEntry] = [
            TodoEntryBuilder.makeEntry(style: configuration.style, forDate: now)
        ]
        for i in 1..<7 {
            let midnight = calendar.startOfDay(for: now.addingTimeInterval(Double(i) * 86400))
            entries.append(TodoEntryBuilder.makeEntry(style: configuration.style, forDate: midnight))
        }

        let nextRefresh = calendar.startOfDay(for: now.addingTimeInterval(7 * 86400))
        return Timeline(entries: entries, policy: .after(nextRefresh))
    }
}

struct FrydayWidgetMedium: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "FrydayWidgetMedium",
            intent: FrydayConfigIntent.self,
            provider: MediumIntentProvider()
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay")
        .description("오늘의 투두를 홈 화면에서 바로 확인하세요. 위젯 편집으로 캐릭터/리스트 스타일 변경 가능.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Bundle

@main
struct FrydayWidgetBundle: WidgetBundle {
    var body: some Widget {
        FrydayWidgetSmall()
        FrydayWidgetMedium()
    }
}

// MARK: - Previews

#Preview("Small", as: .systemSmall) {
    FrydayWidgetSmall()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoEntryBuilder.previewTodos)
}

#Preview("Medium 캐릭터", as: .systemMedium) {
    FrydayWidgetMedium()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: Array(TodoEntryBuilder.previewTodos.prefix(4)), style: .character)
}

#Preview("Medium 리스트", as: .systemMedium) {
    FrydayWidgetMedium()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoEntryBuilder.previewTodos, style: .list)
}

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

// 스타일별 Static Provider
struct StyledStaticProvider: TimelineProvider {
    let style: WidgetStyle

    func placeholder(in context: Context) -> TodoEntry {
        TodoEntryBuilder.staticPlaceholder(style: style)
    }

    func getSnapshot(in context: Context, completion: @escaping (TodoEntry) -> Void) {
        if context.isPreview {
            completion(TodoEntryBuilder.previewSample(style: style))
            return
        }
        completion(TodoEntryBuilder.makeEntry(style: style))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TodoEntry>) -> Void) {
        let now = Date()
        let calendar = Calendar.current

        var entries: [TodoEntry] = [
            TodoEntryBuilder.makeEntry(style: style, forDate: now)
        ]
        for i in 1..<7 {
            let midnight = calendar.startOfDay(for: now.addingTimeInterval(Double(i) * 86400))
            entries.append(TodoEntryBuilder.makeEntry(style: style, forDate: midnight))
        }

        let nextRefresh = calendar.startOfDay(for: now.addingTimeInterval(7 * 86400))
        completion(Timeline(entries: entries, policy: .after(nextRefresh)))
    }
}

// MARK: - Widgets

struct FrydayWidgetSmall: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "FrydayWidgetSmall",
            provider: StyledStaticProvider(style: .character)
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("Small")
        .description("오늘의 투두 개수와 완료 현황을 FryDay의 튀김을 함께 확인하세요.")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct FrydayWidgetMediumChar: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "FrydayWidgetMediumChar",
            provider: StyledStaticProvider(style: .character)
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay - 캐릭터")
        .description("오늘의 핵심 투두를 체크하고, 계획들이 잘 튀겨지고 있는지 확인하세요.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct FrydayWidgetMediumList: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "FrydayWidgetMediumList",
            provider: StyledStaticProvider(style: .list)
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay - 리스트")
        .description("내가 오늘 추가한 투두들을 깔끔한 리스트 형태로 홈화면에서 확인하세요.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

@main
struct FrydayWidgetBundle: WidgetBundle {
    var body: some Widget {
        FrydayWidgetSmall()
        FrydayWidgetMediumChar()
        FrydayWidgetMediumList()
    }
}

// MARK: - Previews

#Preview("Small", as: .systemSmall) {
    FrydayWidgetSmall()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoEntryBuilder.previewTodos)
}

#Preview("Medium 캐릭터", as: .systemMedium) {
    FrydayWidgetMediumChar()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: Array(TodoEntryBuilder.previewTodos.prefix(4)), style: .character)
}

#Preview("Medium 리스트", as: .systemMedium) {
    FrydayWidgetMediumList()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoEntryBuilder.previewTodos, style: .list)
}

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
        TodoItem(id: "todo-1", title: "연우님 기획 차력쇼 감상", categoryCode: "OR", isDone: false),
        TodoItem(id: "todo-2", title: "연우님 기획 차력쇼 감상", categoryCode: "BR", isDone: false),
        TodoItem(id: "todo-3", title: "연우님 기획 차력쇼 감상", categoryCode: "PK", isDone: false),
        TodoItem(id: "todo-4", title: "연우님 기획 차력쇼 감상", categoryCode: "MT", isDone: false),
        TodoItem(id: "todo-5", title: "연우님 기획 차력쇼 감상", categoryCode: "LG", isDone: false),
        TodoItem(id: "todo-6", title: "연우님 기획 차력쇼 감상", categoryCode: "CB", isDone: false),
    ]
}

// MARK: - Provider (Small + Medium 모두 처리)

struct FrydayProvider: AppIntentTimelineProvider {
    typealias Entry = TodoEntry
    typealias Intent = FrydayConfigIntent

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
        let tomorrowMidnight = calendar.startOfDay(for: now.addingTimeInterval(86400))
        let dayAfterMidnight = calendar.startOfDay(for: tomorrowMidnight.addingTimeInterval(86400))

        let todayEntry = TodoEntryBuilder.makeEntry(style: configuration.style, forDate: now)
        let tomorrowEntry = TodoEntryBuilder.makeEntry(style: configuration.style, forDate: tomorrowMidnight)

        return Timeline(
            entries: [todayEntry, tomorrowEntry],
            policy: .after(dayAfterMidnight)
        )
    }

    // 갤러리에서 캐릭터형 / 리스트형 프리뷰 카드 2개 노출
    func recommendations() -> [AppIntentRecommendation<FrydayConfigIntent>] {
        let charIntent = FrydayConfigIntent()
        charIntent.style = .character

        let listIntent = FrydayConfigIntent()
        listIntent.style = .list

        return [
            AppIntentRecommendation(intent: charIntent, description: "캐릭터형"),
            AppIntentRecommendation(intent: listIntent, description: "리스트형"),
        ]
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

// MARK: - Widget (Small + Medium 지원, 단일 kind)

struct FrydayWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "FrydayWidget",
            intent: FrydayConfigIntent.self,
            provider: FrydayProvider()
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay")
        .description("오늘의 투두를 확인해요")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

@main
struct FrydayWidgetBundle: WidgetBundle {
    var body: some Widget {
        FrydayWidget()
    }
}

// MARK: - Previews

#Preview("Small · Full", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "1월 1일 (수)", doneCount: 10, doingCount: 0, isConnected: true, todos: TodoEntryBuilder.previewTodos)
}

#Preview("Medium 캐릭터형", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 0, doingCount: 4, isConnected: true, todos: Array(TodoEntryBuilder.previewTodos.prefix(4)), style: .character)
}

#Preview("Medium 리스트형", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoEntryBuilder.previewTodos, style: .list)
}

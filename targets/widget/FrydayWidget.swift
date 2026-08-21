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
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "ko_KR")
        fmt.dateFormat = "M월 d일 (E)"

        let isoFmt = DateFormatter()
        isoFmt.dateFormat = "yyyy-MM-dd"
        let dateISO = isoFmt.string(from: date)

        // App Group 파일 read (크로스프로세스 신뢰성)
        let state = SharedFileStorage.readJSONObject(SharedFileStorage.stateFile) as? [String: Any]
        let isLoggedIn = (state?["isLoggedIn"] as? Bool) ?? false
        let isServerError = (state?["isServerError"] as? Bool) ?? false
        let isConnected = isLoggedIn && !isServerError

        // pending 을 id 별 count 로 집계 → 홀수만 flip 대상 (parity model)
        let pendingState = SharedFileStorage.readJSON(SharedFileStorage.pendingFile, as: PendingState.self) ?? .empty
        var pendingCounts: [String: Int] = [:]
        pendingState.ids.forEach { pendingCounts[$0, default: 0] += 1 }
        let pendingFlipIds = Set(pendingCounts.filter { $0.value % 2 == 1 }.keys)

        var todos: [TodoItem] = []
        if let byDate = SharedFileStorage.readJSON(SharedFileStorage.todosFile, as: [String: [TodoDTO]].self),
           let dtos = byDate[dateISO] {
            todos = dtos.map { dto in
                let isDone = pendingFlipIds.contains(dto.id) ? !dto.isDone : dto.isDone
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

// MARK: - Entry View (family 에 따라 Small / Medium 분기)

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

// MARK: - Unified Widget — Small + Medium 한 kind 로 통합

struct WidgetIntentProvider: AppIntentTimelineProvider {
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

struct FrydayWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "FrydayWidget",
            intent: FrydayConfigIntent.self,
            provider: WidgetIntentProvider()
        ) { entry in
            FrydayWidgetEntryView(entry: entry)
                .environment(\.redactionReasons, [])
        }
        .configurationDisplayName("FryDay")
        .description("오늘의 할 일과 튀김 현황을 홈 화면에 꺼내두고 매일 바삭한 하루를 보내 보세요.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Bundle

@main
struct FrydayWidgetBundle: WidgetBundle {
    var body: some Widget {
        FrydayWidget()
    }
}

// MARK: - Previews

#Preview("Small", as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoEntryBuilder.previewTodos)
}

#Preview("Medium 캐릭터", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: Array(TodoEntryBuilder.previewTodos.prefix(4)), style: .character)
}

#Preview("Medium 리스트", as: .systemMedium) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "7월 7일 (화)", doneCount: 0, doingCount: 6, isConnected: true, todos: TodoEntryBuilder.previewTodos, style: .list)
}

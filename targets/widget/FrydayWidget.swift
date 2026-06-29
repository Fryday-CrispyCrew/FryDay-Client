import WidgetKit
import SwiftUI

struct TodoEntry: TimelineEntry {
    let date: Date
    let dateString: String
}

struct TodoProvider: TimelineProvider {
    func placeholder(in context: Context) -> TodoEntry {
        TodoEntry(date: Date(), dateString: "5월 23일 (토)")
    }
    
    func getSnapshot(in context: Context, completion: @escaping (TodoEntry) -> Void) {
        completion(makeEntry())
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<TodoEntry>) -> Void) {
        completion(Timeline(entries: [makeEntry()], policy: .atEnd))
    }
    
    private func makeEntry() -> TodoEntry {
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "ko_KR")
        fmt.dateFormat = "M월 d일 (E)"
        return TodoEntry(date: Date(), dateString: fmt.string(from: Date()))
    }
}

struct TodoWidgetView: View {
    var entry: TodoEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.dateString)
                .font(.caption)
                .foregroundColor(.secondary)
            Text("Fryday")
                .font(.headline)
            Text("위젯 테스트")
                .font(.caption2)
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }
}

@main
struct FrydayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FrydayWidget", provider: TodoProvider()) { entry in
            TodoWidgetView(entry: entry)
        }
        .configurationDisplayName("Fryday")
        .description("오늘의 투두를 확인해요")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
#Preview(as: .systemSmall) {
    FrydayWidget()
} timeline: {
    TodoEntry(date: Date(), dateString: "5월 23일 (토)")
}

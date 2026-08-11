import AppIntents
import WidgetKit
import Foundation

struct ToggleTodoIntent: AppIntent {
    static var title: LocalizedStringResource = "투두 완료 토글"
    static var description = IntentDescription("위젯에서 투두 완료 상태를 토글합니다.")

    private static let appGroupID = "group.com.fryday.shared"
    private static let pendingKey = "pendingToggleIds"

    @Parameter(title: "Todo ID")
    var todoId: String

    init() {}

    init(todoId: String) {
        self.todoId = todoId
    }

    func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: Self.appGroupID)

        var pending: [String] = []
        if let jsonString = defaults?.string(forKey: Self.pendingKey),
           let data = jsonString.data(using: .utf8),
           let arr = try? JSONDecoder().decode([String].self, from: data) {
            pending = arr
        }

        if let idx = pending.firstIndex(of: todoId) {
            pending.remove(at: idx)
        } else {
            pending.append(todoId)
        }

        if let data = try? JSONEncoder().encode(pending),
           let jsonString = String(data: data, encoding: .utf8) {
            defaults?.set(jsonString, forKey: Self.pendingKey)
            defaults?.synchronize()
        }

        // 크로스프로세스 UserDefaults disk flush 대기 (앱 콜드 스타트 시 stale read 방지)
        try? await Task.sleep(nanoseconds: 100_000_000)

        WidgetCenter.shared.reloadTimelines(ofKind: "FrydayWidget")
        return .result()
    }
}

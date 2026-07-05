import AppIntents
import WidgetKit
import Foundation

// 위젯 체크박스 탭 시 실행되는 인텐트
// 2단계: App Group에 완료 ID 저장/제거 → 위젯 새로고침으로 시각 반영
struct ToggleTodoIntent: AppIntent {
    static var title: LocalizedStringResource = "투두 완료 토글"
    static var description = IntentDescription("위젯에서 투두 완료 상태를 토글합니다.")

    // App Group에 완료된 todo ID 저장할 키
    private static let appGroupID = "group.com.fryday.shared"
    private static let completedKey = "completedTodoIds"

    @Parameter(title: "Todo ID")
    var todoId: String

    init() {}

    init(todoId: String) {
        self.todoId = todoId
    }

    func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: Self.appGroupID)
        var completed = defaults?.stringArray(forKey: Self.completedKey) ?? []

        if let idx = completed.firstIndex(of: todoId) {
            completed.remove(at: idx)   // 이미 완료됨 → 해제
        } else {
            completed.append(todoId)    // 미완료 → 완료로
        }

        defaults?.set(completed, forKey: Self.completedKey)
        print("[FrydayWidget] Toggle \(todoId), now completed: \(completed)")

        // 위젯 즉시 새로고침
        WidgetCenter.shared.reloadAllTimelines()

        return .result()
    }
}

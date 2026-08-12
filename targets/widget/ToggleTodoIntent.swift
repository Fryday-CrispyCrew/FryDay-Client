import AppIntents
import WidgetKit
import Foundation

struct ToggleTodoIntent: AppIntent {
    static var title: LocalizedStringResource = "투두 완료 토글"
    static var description = IntentDescription("위젯에서 투두 완료 상태를 토글합니다.")

    private static let appGroupID = "group.com.fryday.shared"
    private static let pendingKey = "pendingToggleIds"

    // 여러 intent 가 동시 실행될 때 read-modify-write race 방지용 serial queue
    private static let writeQueue = DispatchQueue(label: "com.fryday.toggle.write")

    @Parameter(title: "Todo ID")
    var todoId: String

    init() {}

    init(todoId: String) {
        self.todoId = todoId
    }

    func perform() async throws -> some IntentResult {
        let capturedId = self.todoId
        // Serial queue 로 read-modify-write 원자화
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            Self.writeQueue.async {
                let defaults = UserDefaults(suiteName: Self.appGroupID)

                var pending: [String] = []
                if let jsonString = defaults?.string(forKey: Self.pendingKey),
                   let data = jsonString.data(using: .utf8),
                   let arr = try? JSONDecoder().decode([String].self, from: data) {
                    pending = arr
                }

                if let idx = pending.firstIndex(of: capturedId) {
                    pending.remove(at: idx)
                } else {
                    pending.append(capturedId)
                }

                if let data = try? JSONEncoder().encode(pending),
                   let jsonString = String(data: data, encoding: .utf8) {
                    defaults?.set(jsonString, forKey: Self.pendingKey)
                    defaults?.synchronize()
                }

                continuation.resume()
            }
        }

        try? await Task.sleep(nanoseconds: 100_000_000)

        WidgetCenter.shared.reloadTimelines(ofKind: "FrydayWidget")
        return .result()
    }
}

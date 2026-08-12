import AppIntents
import WidgetKit
import Foundation

struct ToggleTodoIntent: AppIntent {
    static var title: LocalizedStringResource = "투두 완료 토글"
    static var description = IntentDescription("위젯에서 투두 완료 상태를 토글합니다.")

    private static let appGroupID = "group.com.fryday.shared"
    private static let pendingKey = "pendingToggleIds"
    private static let beforeKey = "pendingBeforeStates"

    private static let writeQueue = DispatchQueue(label: "com.fryday.toggle.write")

    @Parameter(title: "Todo ID")
    var todoId: String

    init() {}

    init(todoId: String) {
        self.todoId = todoId
    }

    func perform() async throws -> some IntentResult {
        let capturedId = self.todoId
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            Self.writeQueue.async {
                let defaults = UserDefaults(suiteName: Self.appGroupID)

                var pending: [String] = []
                if let jsonString = defaults?.string(forKey: Self.pendingKey),
                   let data = jsonString.data(using: .utf8),
                   let arr = try? JSONDecoder().decode([String].self, from: data) {
                    pending = arr
                }

                var beforeMap: [String: Bool] = [:]
                if let jsonString = defaults?.string(forKey: Self.beforeKey),
                   let data = jsonString.data(using: .utf8),
                   let dict = try? JSONDecoder().decode([String: Bool].self, from: data) {
                    beforeMap = dict
                }

                if let idx = pending.firstIndex(of: capturedId) {
                    pending.remove(at: idx)
                    beforeMap.removeValue(forKey: capturedId)
                } else {
                    pending.append(capturedId)
                    // tap 시점의 isDone 을 widget storage 에서 조회
                    var currentIsDone = false
                    if let json = defaults?.string(forKey: "todosByDateJson"),
                       let data = json.data(using: .utf8),
                       let byDate = try? JSONSerialization.jsonObject(with: data) as? [String: [[String: Any]]] {
                        outer: for (_, todos) in byDate {
                            for t in todos {
                                if let tid = t["id"] as? String, tid == capturedId {
                                    currentIsDone = t["isDone"] as? Bool ?? false
                                    break outer
                                }
                            }
                        }
                    }
                    beforeMap[capturedId] = currentIsDone
                }

                if let data = try? JSONEncoder().encode(pending),
                   let jsonString = String(data: data, encoding: .utf8) {
                    defaults?.set(jsonString, forKey: Self.pendingKey)
                }
                if let data = try? JSONEncoder().encode(beforeMap),
                   let jsonString = String(data: data, encoding: .utf8) {
                    defaults?.set(jsonString, forKey: Self.beforeKey)
                }
                defaults?.synchronize()

                continuation.resume()
            }
        }

        try? await Task.sleep(nanoseconds: 100_000_000)

        WidgetCenter.shared.reloadTimelines(ofKind: "FrydayWidget")
        return .result()
    }
}

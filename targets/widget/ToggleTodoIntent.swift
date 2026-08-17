import AppIntents
import WidgetKit
import Foundation

struct ToggleTodoIntent: AppIntent {
    static var title: LocalizedStringResource = "투두 완료 토글"
    static var description = IntentDescription("위젯에서 투두 완료 상태를 토글합니다.")

    // 파일 write 는 NSFileCoordinator 로 코디네이션되지만
    // 우리 프로세스 안에서는 직렬 실행 보장을 위해 큐 사용
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
                var state = SharedFileStorage.readJSON(SharedFileStorage.pendingFile, as: PendingState.self) ?? .empty

                if let idx = state.ids.firstIndex(of: capturedId) {
                    state.ids.remove(at: idx)
                    state.before.removeValue(forKey: capturedId)
                } else {
                    state.ids.append(capturedId)
                    // tap 시점의 isDone 을 widget-todos.json 에서 조회
                    var currentIsDone = false
                    if let byDate = SharedFileStorage.readJSONObject(SharedFileStorage.todosFile) as? [String: [[String: Any]]] {
                        outer: for (_, todos) in byDate {
                            for t in todos {
                                if let tid = t["id"] as? String, tid == capturedId {
                                    currentIsDone = (t["isDone"] as? Bool) ?? false
                                    break outer
                                }
                            }
                        }
                    }
                    state.before[capturedId] = currentIsDone
                }

                SharedFileStorage.writeJSON(state, to: SharedFileStorage.pendingFile)
                // 앱 프로세스가 리스닝 중이면 즉시 drain 트리거
                SharedFileStorage.postPendingChangedNotification()

                continuation.resume()
            }
        }

        // 파일 write 는 즉시 disk flush 되므로 sleep 불필요
        WidgetCenter.shared.reloadTimelines(ofKind: "FrydayWidget")
        return .result()
    }
}

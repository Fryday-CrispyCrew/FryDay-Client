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
                // 매 tap 을 log 로 append. cancel-pending 로직 없음.
                // 위젯/앱 표시는 count 파리티 (홀수=flip) 로 판정.
                var state = SharedFileStorage.readJSON(SharedFileStorage.pendingFile, as: PendingState.self) ?? .empty
                state.ids.append(capturedId)
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

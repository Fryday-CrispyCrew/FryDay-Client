import Foundation

// App Group 컨테이너의 파일을 NSFileCoordinator 로 read/write.
// UserDefaults 크로스프로세스 sync 이슈 회피용.
enum SharedFileStorage {
    static let appGroupID = "group.com.fryday.shared"

    static let pendingFile = "widget-pending.json"
    static let todosFile = "widget-todos.json"
    static let stateFile = "widget-state.json"

    // 위젯 → 앱 파일 변경 알림 (Darwin notification, 크로스프로세스)
    static let pendingChangedNotification = "com.fryday.widget-pending-changed" as CFString

    static func postPendingChangedNotification() {
        CFNotificationCenterPostNotification(
            CFNotificationCenterGetDarwinNotifyCenter(),
            CFNotificationName(pendingChangedNotification),
            nil, nil, true
        )
    }

    private static func url(for fileName: String) -> URL? {
        FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: appGroupID)?
            .appendingPathComponent(fileName)
    }

    static func readString(_ fileName: String) -> String? {
        guard let fileURL = url(for: fileName) else { return nil }
        var readError: NSError?
        var result: String? = nil
        let coordinator = NSFileCoordinator()
        coordinator.coordinate(readingItemAt: fileURL, options: [], error: &readError) { url in
            result = try? String(contentsOf: url, encoding: .utf8)
        }
        return result
    }

    @discardableResult
    static func writeString(_ contents: String, to fileName: String) -> Bool {
        guard let fileURL = url(for: fileName) else { return false }
        var writeError: NSError?
        var success = false
        let coordinator = NSFileCoordinator()
        coordinator.coordinate(writingItemAt: fileURL, options: .forReplacing, error: &writeError) { url in
            do {
                try contents.write(to: url, atomically: true, encoding: .utf8)
                success = true
            } catch {
                success = false
            }
        }
        return success
    }

    static func readJSON<T: Decodable>(_ fileName: String, as type: T.Type) -> T? {
        guard let str = readString(fileName),
              let data = str.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }

    static func readJSONObject(_ fileName: String) -> Any? {
        guard let str = readString(fileName),
              let data = str.data(using: .utf8) else { return nil }
        return try? JSONSerialization.jsonObject(with: data)
    }

    @discardableResult
    static func writeJSON<T: Encodable>(_ value: T, to fileName: String) -> Bool {
        guard let data = try? JSONEncoder().encode(value),
              let str = String(data: data, encoding: .utf8) else { return false }
        return writeString(str, to: fileName)
    }
}

struct PendingState: Codable {
    var ids: [String]
    var before: [String: Bool]

    static let empty = PendingState(ids: [], before: [:])
}

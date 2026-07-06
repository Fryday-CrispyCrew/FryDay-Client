import AppIntents
import WidgetKit

// Medium 위젯 스타일 옵션 (Entry 에서만 사용)
enum WidgetStyle: String, AppEnum {
    case character   // 02: 캐릭터형
    case list        // 03: 리스트형

    static var typeDisplayRepresentation: TypeDisplayRepresentation {
        TypeDisplayRepresentation(name: "Medium 위젯 스타일")
    }

    static var caseDisplayRepresentations: [WidgetStyle: DisplayRepresentation] {
        [
            .character: DisplayRepresentation(title: "캐릭터형"),
            .list: DisplayRepresentation(title: "리스트형")
        ]
    }
}

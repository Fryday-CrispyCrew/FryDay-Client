import AppIntents
import WidgetKit

// Medium 위젯 스타일 옵션
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

// 캐릭터형 기본값 (편집 시 리스트로 전환 가능)
struct FrydayCharConfigIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "위젯 스타일"
    static var description = IntentDescription("Medium 위젯의 스타일을 선택합니다.")

    @Parameter(title: "스타일", default: .character)
    var style: WidgetStyle
}

// 리스트형 기본값 (편집 시 캐릭터형으로 전환 가능)
struct FrydayListConfigIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "위젯 스타일"
    static var description = IntentDescription("Medium 위젯의 스타일을 선택합니다.")

    @Parameter(title: "스타일", default: .list)
    var style: WidgetStyle
}

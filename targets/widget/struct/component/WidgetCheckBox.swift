import SwiftUI
import WidgetKit
import AppIntents

// 위젯용 카테고리 체크박스 (Interactive)
// 완료 여부에 따라 RadioOff (회색) / RadioOn (카테고리 색) 렌더링
// 탭 시 ToggleTodoIntent 실행 → App Group 저장 → 위젯 새로고침
struct WidgetCheckBox: View {
    let todo: TodoItem

    var body: some View {
        Button(intent: ToggleTodoIntent(todoId: todo.id)) {
            Group {
                if todo.isDone {
                    Image("RadioOn")
                        .renderingMode(.template)
                        .resizable()
                        .widgetAccentedRenderingMode(.fullColor)
                        .scaledToFit()
                        .foregroundStyle(AppColor.Category.color(for: todo.categoryCode))
                } else {
                    Image("RadioOff")
                        .renderingMode(.template)
                        .resizable()
                        .widgetAccentedRenderingMode(.fullColor)
                        .scaledToFit()
                        .foregroundStyle(AppColor.Gray.gr200)
                }
            }
            .frame(width: 20, height: 20)
        }
        .buttonStyle(.plain)
    }
}

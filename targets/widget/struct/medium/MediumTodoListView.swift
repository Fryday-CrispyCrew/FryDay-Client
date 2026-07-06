import SwiftUI
import WidgetKit

// 03_Medium — 캐릭터 없이 투두만 표시하는 리스트형 위젯
// 최대 6개 (2열 × 3행), 왼쪽→오른쪽, 위→아래 순서로 채움
struct MediumTodoListView: View {
    var entry: TodoEntry

    var body: some View {
        Group {
            switch entry.state {
            case .error:
                errorView
            case .empty:
                emptyView
            case .full, .frying:
                listView
            }
        }
        .containerBackground(AppColor.Gray.surface, for: .widget)
    }

    // MARK: - List — 최대 6개 투두 (2열 × 3행)
    // 위젯 상하좌우 18pt 패딩, 요일↔박스 20pt, 투두 행 간격 16pt, 투두 셀 간 12pt
    private var listView: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(entry.dateString)
                .font(.caption)
                .foregroundColor(AppColor.Gray.gr500)
                .padding(.top, 18)

            Spacer().frame(height: 25)

            LazyVGrid(
                columns: [
                    GridItem(.flexible(), spacing: 12, alignment: .leading),
                    GridItem(.flexible(), spacing: 12, alignment: .leading)
                ],
                alignment: .leading,
                spacing: 16
            ) {
                ForEach(entry.todos.prefix(6)) { todo in
                    HStack(spacing: 8) {
                        Text(truncated(todo.title, maxChars: 13))
                            .font(.system(size: 12))
                            .lineSpacing(6)
                            .foregroundColor(AppColor.Gray.text)
                            .lineLimit(1)
                        Spacer(minLength: 0)
                        WidgetCheckBox(todo: todo)
                    }
                    .padding(.trailing, 5)
                }
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 18)
        .padding(.bottom, 18)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }

    // 13자 초과 시 뒤에 말줄임표 (02와 동일 로직)
    private func truncated(_ s: String, maxChars: Int) -> String {
        if s.count <= maxChars { return s }
        return String(s.prefix(maxChars)) + "..."
    }

    // MARK: - Empty — 빈 상태 아이콘 + 안내 텍스트
    private var emptyView: some View {
        stateView(
            image: "Medium_Bowl",
            line1: "아직 튀긴 투두가 없어요.",
            line2: "위젯을 눌러 투두를 추가해 주세요!",
            textColor: AppColor.Gray.gr700
        )
    }

    // MARK: - Error — Bowl_Error 아이콘 + 안내 텍스트
    private var errorView: some View {
        stateView(
            image: "Medium_Bowl_Error",
            line1: "앱을 열어",
            line2: "연결 상태를 확인해 주세요.",
            textColor: AppColor.Gray.gr500
        )
    }

    private func stateView(image: String, line1: String, line2: String, textColor: Color) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(entry.dateString)
                .font(.caption)
                .foregroundColor(AppColor.Gray.gr500)
                .padding(.top, 18)
                .padding(.leading, 18)

            Spacer(minLength: 0)

            VStack(spacing: 8) {
                Image(image)
                    .renderingMode(.original)
                    .resizable()
                    .widgetAccentedRenderingMode(.fullColor)
                    .scaledToFit()
                    .frame(width: 40, height: 40)

                VStack(spacing: 2) {
                    Text(line1)
                        .font(.system(size: 12))
                        .foregroundColor(textColor)
                    Text(line2)
                        .font(.system(size: 12))
                        .foregroundColor(textColor)
                }
            }
            .frame(maxWidth: .infinity, alignment: .center)

            Spacer(minLength: 0)
        }
        .padding(.bottom, 18)
    }
}

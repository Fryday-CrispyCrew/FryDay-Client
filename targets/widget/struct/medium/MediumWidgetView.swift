import SwiftUI
import WidgetKit

// 02_Medium — 좌측 투두 리스트 + 우측 헤더/캐릭터
struct MediumWidgetView: View {
    var entry: TodoEntry

    var body: some View {
        Group {
            switch entry.state {
            case .error:
                errorView
            case .empty:
                emptyView
            case .full, .frying:
                contentView
            }
        }
        .containerBackground(.background, for: .widget)
    }

    // MARK: - Full / Frying — 투두 리스트 + 캐릭터
    private var contentView: some View {
        GeometryReader { geo in
            HStack(alignment: .top, spacing: 8) {
                // 좌측 투두 리스트 (최대 4개, 텍스트 12pt / 행간 150 / 각 행 간격 16pt)
                VStack(alignment: .leading, spacing: 16) {
                    ForEach(entry.todos.prefix(4)) { todo in
                        HStack(spacing: 8) {
                            Text(truncated(todo.title, maxChars: 8))
                                .font(.system(size: 12))
                                .lineSpacing(6)
                                .foregroundColor(AppColor.Gray.text)
                                .lineLimit(1)
                            WidgetCheckBox(todo: todo)
                        }
                    }
                    Spacer(minLength: 0)
                }
                .padding(.leading, 18)
                .padding(.top, 18)
                .frame(width: geo.size.width * 0.58, alignment: .leading)

                // 우측 헤더 + 캐릭터 (완료=Full, 진행중=Frying)
                ZStack(alignment: .bottomTrailing) {
                    Image(entry.state == .full ? "Medium_Full" : "Medium_Frying")
                        .renderingMode(.original)
                        .resizable()
                        .widgetAccentedRenderingMode(.fullColor)
                        .scaledToFit()
                        .frame(maxWidth: geo.size.width * 0.55, maxHeight: geo.size.height * 0.95, alignment: .bottomTrailing)
                        .padding(.bottom, 0)
                        .padding(.trailing, 0)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                }
                .overlay(alignment: .topTrailing) {
                    WidgetHeader(
                        dateString: entry.dateString,
                        doneCount: entry.doneCount,
                        doingCount: entry.doingCount
                    )
                    .padding(.top, 18)
                    .padding(.trailing, 18)
                }
            }
        }
    }

    // 13자 초과 시 뒤에 말줄임표
    private func truncated(_ s: String, maxChars: Int) -> String {
        if s.count <= maxChars { return s }
        return String(s.prefix(maxChars)) + "..."
    }

    // MARK: - Empty — 안내 텍스트 + 캐릭터+말풍선 이미지
    private var emptyView: some View {
        GeometryReader { geo in
            ZStack(alignment: .bottomTrailing) {
                Image("Medium_Empty")
                    .renderingMode(.original)
                    .resizable()
                    .widgetAccentedRenderingMode(.fullColor)
                    .scaledToFit()
                    .frame(maxWidth: geo.size.width * 0.72, alignment: .bottomTrailing)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
            }
            .overlay(alignment: .topLeading) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("아직 튀긴 투두가 없어요.")
                        .font(.caption)
                        .foregroundColor(AppColor.Gray.gr700)
                    Text("위젯을 눌러 투두를 추가해 주세요!")
                        .font(.caption)
                        .foregroundColor(AppColor.Gray.gr700)
                }
                .padding(.leading, 18)
                .padding(.top, 18)
            }
            .overlay(alignment: .topTrailing) {
                WidgetHeader(
                    dateString: entry.dateString,
                    doneCount: entry.doneCount,
                    doingCount: entry.doingCount
                )
                .padding(.top, 18)
                .padding(.trailing, 18)
            }
        }
    }

    // MARK: - Error — 안내 텍스트 + Bowl_Error 이미지
    private var errorView: some View {
        GeometryReader { geo in
            ZStack(alignment: .bottomTrailing) {
                Image("Medium_Bowl_Error")
                    .renderingMode(.original)
                    .resizable()
                    .widgetAccentedRenderingMode(.fullColor)
                    .scaledToFit()
                    .frame(maxWidth: geo.size.width * 0.72, alignment: .bottomTrailing)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
            }
            .overlay(alignment: .topLeading) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("앱을 열어")
                        .font(.caption)
                        .foregroundColor(AppColor.Gray.gr700)
                    Text("연결 상태를 확인해 주세요.")
                        .font(.caption)
                        .foregroundColor(AppColor.Gray.gr700)
                }
                .padding(.leading, 18)
                .padding(.top, 18)
            }
            .overlay(alignment: .topTrailing) {
                Text(entry.dateString)
                    .font(.caption)
                    .foregroundColor(AppColor.Gray.gr500)
                    .padding(.top, 18)
                    .padding(.trailing, 18)
            }
        }
    }
}

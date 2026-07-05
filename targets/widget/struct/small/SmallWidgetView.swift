import SwiftUI
import WidgetKit

// iOS 18+ 에서만 위젯 틴트 모드 무시 (원본 색상 유지)
// iOS 17 이하는 modifier 자체가 없으므로 그냥 통과
extension View {
    @ViewBuilder
    func fullColorIfAvailable() -> some View {
        if #available(iOS 18.0, *) {
            self.widgetAccentedRenderingMode(.fullColor)
        } else {
            self
        }
    }
}

struct SmallWidgetView: View {
    var entry: TodoEntry

    var body: some View {
        Group {
            if entry.state == .error {
                errorView
            } else {
                contentView
            }
        }
        .containerBackground(.background, for: .widget)
    }

    // Full / Frying / Empty 공통 레이아웃 (캐릭터 좌하단 + 우상단 헤더)
    private var contentView: some View {
        GeometryReader { geo in
            Image(characterImageName)
                .resizable()
                .scaledToFit()
                .fullColorIfAvailable()
                .frame(width: geo.size.width * 0.85)
                .padding(.leading, 0)
                .padding(.bottom, 0)
                .frame(width: geo.size.width, height: geo.size.height, alignment: .bottomLeading)
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

    // 로그아웃/연결 실패 상태
    private var errorView: some View {
        VStack(spacing: 0) {
            HStack {
                Spacer()
                Text(entry.dateString)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 12)
            .padding(.trailing, 12)

            Spacer()

            Text("FryDay에\n연결할 수 없어요.\n위젯을 눌러\n앱을 다시 시작해 주세요!")
                .font(.caption)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 12)

            Spacer()
        }
    }

    private var characterImageName: String {
        switch entry.state {
        case .full:   return "Small_Full"
        case .frying: return "Small_Frying"
        case .empty:  return "Small_Empty"
        case .error:  return ""
        }
    }
}

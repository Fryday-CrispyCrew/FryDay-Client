import SwiftUI
import WidgetKit

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

    // Full / Frying / Empty 공통 레이아웃 (캐릭터 배경 + 우상단 헤더)
    private var contentView: some View {
        ZStack(alignment: .topTrailing) {
            Image(characterImageName)
                .resizable()
                .scaledToFill()
                .frame(maxWidth: .infinity, maxHeight: .infinity)

            WidgetHeader(
                dateString: entry.dateString,
                doneCount: entry.doneCount,
                doingCount: entry.doingCount
            )
            .padding(.top, 12)
            .padding(.trailing, 12)
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
                .padding(.horizontal, 8)

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

// WidgetHeader.swift
import SwiftUI

struct WidgetHeader: View {
    let dateString: String
    let doneCount: Int
    let doingCount: Int

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            Text(dateString)
                .font(.caption)
                .foregroundColor(AppColor.Gray.gr500)

            HStack(spacing: 8) {
                HStack(spacing: 4) {
                    Image("icon_done")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 16, height: 16)
                    Text("\(doneCount)")
                        .foregroundColor(AppColor.Category.OR)
                }
                HStack(spacing: 4) {
                    Image("icon_doing")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 16, height: 16)
                    Text("\(doingCount)")
                        .foregroundColor(AppColor.Gray.gr700)
                }
            }
            .font(.caption)
        }
        .fixedSize()
    }
}

struct IconTextLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 2) {
            configuration.icon
                .frame(width: 14, height: 14)
            configuration.title
        }
    }
}
extension LabelStyle where Self == IconTextLabelStyle {
    static var iconText: IconTextLabelStyle { IconTextLabelStyle() }
}

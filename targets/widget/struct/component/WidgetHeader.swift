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
                .foregroundColor(.secondary)

            HStack(spacing: 8) {
                Label("\(doneCount)", image: "icon_done")
                    .labelStyle(.iconText)
                Label("\(doingCount)", image: "icon_doing")
                    .labelStyle(.iconText)
            }
            .font(.caption.bold())
        }
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
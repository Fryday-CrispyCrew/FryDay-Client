import SwiftUI
import UIKit

// MARK: - FryDay 디자인 시스템 컬러
// Light/Dark Mode 자동 전환

enum AppColor {

    // MARK: Primary
    /// 메인 오렌지 — Light: #FF5B22 / Dark: #FF642F
    static let primary = dynamic(light: 0xFF5B22, dark: 0xFF642F)

    // MARK: Secondary
    /// 보조 그레이 — Light: #F4F4F4 / Dark: #212120
    static let secondary = dynamic(light: 0xF4F4F4, dark: 0x212120)

    // MARK: Secondary / Category
    enum Category {
        /// OR — Light: #FF5B22 / Dark: #FF642F
        static let OR = dynamic(light: 0xFF5B22, dark: 0xFF642F)
        /// BR — Light: #693838 / Dark: #7C4E4E
        static let BR = dynamic(light: 0x693838, dark: 0x7C4E4E)
        /// LG — Light: #82B236 / Dark: #A8DB57
        static let LG = dynamic(light: 0x82B236, dark: 0xA8DB57)
        /// CB — Light: #3E78AE / Dark: #458FD5
        static let CB = dynamic(light: 0x3E78AE, dark: 0x458FD5)
        /// DP — Light: #D0509D / Dark: #ED63B6
        static let DP = dynamic(light: 0xD0509D, dark: 0xED63B6)
        /// MT — Light: #3CB492 / Dark: #46D5AD
        static let MT = dynamic(light: 0x3CB492, dark: 0x46D5AD)
        /// VL — Light: #9351A1 / Dark: #AF66BE
        static let VL = dynamic(light: 0x9351A1, dark: 0xAF66BE)
        /// PK — Light: #F06B9C / Dark: #FF76A8
        static let PK = dynamic(light: 0xF06B9C, dark: 0xFF76A8)
        /// MB — Light: #AA7459 / Dark: #BC7958
        static let MB = dynamic(light: 0xAA7459, dark: 0xBC7958)

        /// 백엔드 카테고리 코드 문자열 → Color
        /// 알 수 없는 코드는 OR로 fallback
        static func color(for code: String) -> Color {
            switch code.uppercased() {
            case "OR": return OR
            case "BR": return BR
            case "LG": return LG
            case "CB": return CB
            case "DP": return DP
            case "MT": return MT
            case "VL": return VL
            case "PK": return PK
            case "MB": return MB
            default:   return OR
            }
        }
    }

    // MARK: Gray Scale
    /// 다크모드에서 텍스트/서피스가 반전됨 주의
    enum Gray {
        /// Text (본문) — Light: #141312 / Dark: #FAFAFA
        static let text    = dynamic(light: 0x141312, dark: 0xFAFAFA)
        static let gr900   = dynamic(light: 0x4F4E4D, dark: 0xF2F2F2)
        static let gr700   = dynamic(light: 0x5D5E60, dark: 0xEAEAEA)
        static let gr500   = dynamic(light: 0x8A8989, dark: 0xC4C4C3)
        static let gr300   = dynamic(light: 0xC4C4C3, dark: 0x8A8989)
        static let gr200   = dynamic(light: 0xEAEAEA, dark: 0x5D5E60)
        static let gr100   = dynamic(light: 0xF2F2F2, dark: 0x4F4E4D)
        /// Surface (배경) — Light: #FAFAFA / Dark: #141312
        static let surface = dynamic(light: 0xFAFAFA, dark: 0x141312)
    }

    // MARK: Transparency
    /// Text 계열은 다크에서 흰색 기반, Surface 계열은 다크에서 검정 기반
    enum Transparency {
        static let text25    = dynamic(light: 0x141312, dark: 0xFAFAFA).opacity(0.25)
        static let text50    = dynamic(light: 0x141312, dark: 0xFAFAFA).opacity(0.5)
        static let text75    = dynamic(light: 0x141312, dark: 0xFAFAFA).opacity(0.75)
        static let surface25 = dynamic(light: 0xFAFAFA, dark: 0x141312).opacity(0.25)
        static let surface50 = dynamic(light: 0xFAFAFA, dark: 0x141312).opacity(0.5)
        static let surface75 = dynamic(light: 0xFAFAFA, dark: 0x141312).opacity(0.75)
    }

    // MARK: - Helpers
    private static func dynamic(light: UInt, dark: UInt) -> Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(hex: dark)
                : UIColor(hex: light)
        })
    }
}

private extension UIColor {
    convenience init(hex: UInt) {
        let r = CGFloat((hex >> 16) & 0xFF) / 255
        let g = CGFloat((hex >> 8)  & 0xFF) / 255
        let b = CGFloat(hex         & 0xFF) / 255
        self.init(red: r, green: g, blue: b, alpha: 1)
    }
}


import SwiftUI
import UIKit
import XCTest
@testable import RepMileUI

/// #94: the 44 variables of "Repmile · Cor" in both modes, as read from the Figma's `valuesByMode` on 2026-11-27 (collection
/// `VariableCollectionId:507:2`; dark "A · Sem acento" 507:0, light "A · Claro" 507:3), resolving by the system appearance.
final class PaletteTokensTests: XCTestCase {
    /// The source of truth, name|dark|light (hex with alpha when not opaque), in the Figma's order.
    static let figma = """
    fundo/app|0c0d10|f3f4f6
    fundo/elevado|15171b|ffffff
    fundo/elevado-2|1e2126|e9ebef
    fundo/trilho|2a2e36|d9dce2
    linha/divisor|ffffff1a|0c0d101a
    linha/base|ffffff4d|0c0d1052
    texto/primario|f3f4f6|0c0d10
    texto/secundario|a4a8b1|4a4f58
    texto/terciario|7c818b|6b707a
    agora|ffffff|0c0d10
    agora/sobre|0c0d10|ffffff
    agora/suave|ffffff1f|0c0d1014
    acao/corrida|2f6fed|1f63e0
    acao/corrida-texto|ffffff|ffffff
    acao/forca|ff6a2c|e8551a
    acao/forca-texto|1a0d05|1a0d05
    corrida|4b8bff|1f63e0
    corrida/cheio|2f6fed|1f63e0
    corrida/sobre|ffffff|ffffff
    corrida/suave|4b8bff29|1f63e01f
    corrida/previsto|4b8bff6b|1f63e061
    forca|ff6a2c|e8551a
    forca/sobre|1a0d05|1a0d05
    forca/suave|ff6a2c29|e8551a1f
    forca/previsto|ff6a2c6b|e8551a61
    marco|e6d2a8|8a6a24
    marco/suave|e6d2a81f|8a6a241f
    estado/positivo|cfff04|4f7a00
    estado/positivo-suave|cfff0424|4f7a001f
    estado/negativo|ff5a5f|d12f36
    estado/negativo-suave|ff5a5f24|d12f361f
    zona/1|8a8f98|6b707a
    zona/2|2ec4d6|0e9fb3
    zona/3|45c977|1e9e55
    zona/4|f5b83d|c98a0a
    zona/5|f2566e|d93a55
    luz/corrida|4b8bff42|1f63e024
    luz/corrida-fim|4b8bff00|1f63e000
    luz/forca|ff6a2c3d|e8551a1f
    luz/forca-fim|ff6a2c00|e8551a00
    luz/neutra|ffffff17|0c0d1000
    luz/neutra-fim|ffffff00|0c0d1000
    luz/marco|e6d2a833|8a6a241f
    luz/marco-fim|e6d2a800|8a6a2400
    """

    static func rgba(_ hex: Substring) -> UInt32 {
        let v = UInt32(hex, radix: 16)!
        return hex.count == 6 ? v << 8 | 0xFF : v
    }

    static let light = UITraitCollection(userInterfaceStyle: .light)
    static let dark = UITraitCollection(userInterfaceStyle: .dark)

    static func components(_ color: UIColor) -> UInt32 {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        XCTAssertTrue(color.getRed(&r, green: &g, blue: &b, alpha: &a))
        let c = { (x: CGFloat) in UInt32((x * 255).rounded()) }
        return c(r) << 24 | c(g) << 16 | c(b) << 8 | c(a)
    }

    // MARK: both modes, every variable

    func testEveryFigmaVariableIsATokenWithBothModes() {
        let rows = Self.figma.split(separator: "\n").map { $0.trimmingCharacters(in: .whitespaces).split(separator: "|") }
        XCTAssertEqual(rows.count, 44)
        XCTAssertEqual(RMColorToken.all.map(\.figmaName), rows.map { String($0[0]) }, "same 44 names, same order")
        XCTAssertEqual(Set(RMColorToken.all.map(\.figmaName)).count, 44, "no duplicate")
        for (token, row) in zip(RMColorToken.all, rows) {
            XCTAssertEqual(token.dark, Self.rgba(row[1]), "\(token.figmaName) dark")
            XCTAssertEqual(token.light, Self.rgba(row[2]), "\(token.figmaName) light")
        }
    }

    func testEachTokenResolvesByAppearance() {
        for token in RMColorToken.all {
            XCTAssertEqual(Self.components(token.uiColor.resolvedColor(with: Self.dark)), token.dark, "\(token.figmaName) dark")
            XCTAssertEqual(Self.components(token.uiColor.resolvedColor(with: Self.light)), token.light, "\(token.figmaName) light")
            // An unspecified appearance is light, as in UIKit.
            XCTAssertEqual(token.value(for: .unspecified), token.light, token.figmaName)
        }
    }

    /// The palette the screens use is the dynamic one, not a frozen dark copy (the app used to pin `.dark`).
    func testThePaletteTheScreensUseFollowsTheAppearance() {
        let pairs: [(Color, RMColorToken)] = [(RM.Palette.fundoApp, .fundoApp), (RM.Palette.textoPrimario, .textoPrimario),
                                              (RM.Palette.agora, .agora), (RM.Palette.agoraSobre, .agoraSobre),
                                              (RM.Palette.negativo, .negativo), (RM.Palette.negativoSuave, .negativoSuave),
                                              (RM.Palette.corrida, .corrida), (RM.Palette.forca, .forca), (RM.Palette.zonas[3], .zona4)]
        for (color, token) in pairs {
            XCTAssertEqual(Self.components(UIColor(color).resolvedColor(with: Self.light)), token.light, token.figmaName)
            XCTAssertEqual(Self.components(UIColor(color).resolvedColor(with: Self.dark)), token.dark, token.figmaName)
        }
        XCTAssertEqual(RM.Palette.zonas.count, 5)
    }

    // MARK: illustrations

    /// Every line-art illustration has a light and a dark variant in the catalog (the light one is not the dark drawing).
    func testIllustrationsHaveALightVariant() throws {
        for ill in RMIllustration.allCases {
            let name = "traco-" + ill.rawValue
            let l = try XCTUnwrap(UIImage(named: name, in: .module, compatibleWith: Self.light), name)
            let d = try XCTUnwrap(UIImage(named: name, in: .module, compatibleWith: Self.dark), name)
            XCTAssertEqual(l.size, d.size, name)
            XCTAssertNotEqual(l.pngData(), d.pngData(), "\(name): the light variant differs from the dark one")
        }
    }
}

import UIKit
import XCTest
@testable import RepMileUI

/// #94 · WCAG 2.x contrast of the text/background pairs the screens use, in both modes. A translucent colour is composited over what it
/// sits on. Values are the Figma's; a pair below AA is a design question, never fixed here by changing a value: the known ones are pinned
/// so a new one fails and the open ones stay visible (evidence: `audits/v1-ios-swiftui-2026-11-26/results/i94-light-mode/contrast.txt`).
final class ContrastTests: XCTestCase {
    enum Mode: CaseIterable { case dark, light }

    /// A background: a token, or a translucent token over another.
    struct Ground { let top: RMColorToken; let base: RMColorToken? }
    static func on(_ t: RMColorToken) -> Ground { Ground(top: t, base: nil) }
    static func on(_ t: RMColorToken, over b: RMColorToken) -> Ground { Ground(top: t, base: b) }

    typealias RGB = (r: Double, g: Double, b: Double)
    static func rgba(_ token: RMColorToken, _ mode: Mode) -> (RGB, Double) {
        let v = mode == .dark ? token.dark : token.light
        return ((Double(v >> 24 & 0xFF), Double(v >> 16 & 0xFF), Double(v >> 8 & 0xFF)), Double(v & 0xFF) / 255)
    }
    static func over(_ fg: (RGB, Double), _ bg: RGB) -> RGB {
        let a = fg.1
        return (fg.0.r * a + bg.r * (1 - a), fg.0.g * a + bg.g * (1 - a), fg.0.b * a + bg.b * (1 - a))
    }
    static func resolve(_ g: Ground, _ mode: Mode) -> RGB {
        let base = g.base.map { rgba($0, mode).0 } ?? (0, 0, 0)
        return over(rgba(g.top, mode), base)
    }
    static func luminance(_ c: RGB) -> Double {
        func ch(_ x: Double) -> Double { let s = x / 255; return s <= 0.03928 ? s / 12.92 : pow((s + 0.055) / 1.055, 2.4) }
        return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b)
    }
    static func ratio(_ text: RMColorToken, _ ground: Ground, _ mode: Mode) -> Double {
        let bg = resolve(ground, mode)
        let fg = over(rgba(text, mode), bg)
        let (a, b) = (luminance(fg), luminance(bg))
        return (max(a, b) + 0.05) / (min(a, b) + 0.05)
    }

    /// Text on its ground, as the screens draw it.
    static let textPairs: [(String, RMColorToken, Ground)] = [
        ("primario/app", .textoPrimario, on(.fundoApp)), ("primario/elevado", .textoPrimario, on(.fundoElevado)),
        ("primario/elevado-2", .textoPrimario, on(.fundoElevado2)),
        ("secundario/app", .textoSecundario, on(.fundoApp)), ("secundario/elevado", .textoSecundario, on(.fundoElevado)),
        ("secundario/elevado-2", .textoSecundario, on(.fundoElevado2)),
        ("terciario/app", .textoTerciario, on(.fundoApp)), ("terciario/elevado", .textoTerciario, on(.fundoElevado)),
        ("terciario/elevado-2", .textoTerciario, on(.fundoElevado2)),
        ("agora-sobre/agora", .agoraSobre, on(.agora)), ("agora/app", .agora, on(.fundoApp)),
        ("agora/tab-ativa", .agora, on(.agoraSuave, over: .fundoElevado)),
        ("acao-corrida", .acaoCorridaTexto, on(.acaoCorrida)), ("acao-forca", .acaoForcaTexto, on(.acaoForca)),
        ("corrida-sobre/cheio", .corridaSobre, on(.corridaCheio)), ("forca-sobre/forca", .forcaSobre, on(.forca)),
        ("corrida/app", .corrida, on(.fundoApp)), ("corrida/elevado", .corrida, on(.fundoElevado)),
        ("corrida/suave", .corrida, on(.corridaSuave, over: .fundoElevado)),
        ("forca/app", .forca, on(.fundoApp)), ("forca/elevado", .forca, on(.fundoElevado)),
        ("forca/suave", .forca, on(.forcaSuave, over: .fundoElevado)),
        ("marco/app", .marco, on(.fundoApp)), ("marco/elevado", .marco, on(.fundoElevado)),
        ("positivo/app", .positivo, on(.fundoApp)), ("positivo/elevado", .positivo, on(.fundoElevado)),
        ("negativo/app", .negativo, on(.fundoApp)), ("negativo/elevado", .negativo, on(.fundoElevado)),
        ("negativo/banner-urgente", .negativo, on(.negativoSuave, over: .fundoApp)),
        ("primario/banner-urgente", .textoPrimario, on(.negativoSuave, over: .fundoApp)),
    ]

    /// Pairs below 4.5:1, per mode: the design questions open in #94 (all at least 3:1, the large-text level).
    static let belowAA: [Mode: Set<String>] = [
        .dark: ["terciario/elevado-2", "corrida/suave"],
        .light: ["terciario/elevado-2", "forca/app", "forca/elevado", "forca/suave", "negativo/banner-urgente"],
    ]

    func testTextPairsMeetAAExceptThePinnedDesignQuestions() {
        for mode in Mode.allCases {
            var below: Set<String> = []
            for (name, text, ground) in Self.textPairs {
                let r = Self.ratio(text, ground, mode)
                XCTAssertGreaterThanOrEqual(r, 3, "\(name) \(mode): below even the large-text level")
                if r < 4.5 { below.insert(name) }
            }
            XCTAssertEqual(below, Self.belowAA[mode], "\(mode)")
        }
    }

    /// The core reading pairs (primary and secondary text, the main action) hold AA in both modes.
    func testCoreReadingPairsHoldAAInBothModes() {
        let core = ["primario/app", "primario/elevado", "secundario/app", "secundario/elevado", "agora-sobre/agora",
                    "primario/banner-urgente", "acao-corrida", "acao-forca"]
        for mode in Mode.allCases {
            for (name, text, ground) in Self.textPairs where core.contains(name) {
                XCTAssertGreaterThanOrEqual(Self.ratio(text, ground, mode), 4.5, "\(name) \(mode)")
            }
        }
    }

    /// The urgent banner's frame (estado/negativo, 2 pt) stands out of the page in both modes (non-text, 3:1).
    func testTheUrgentBannerBorderStandsOutInBothModes() {
        for mode in Mode.allCases {
            XCTAssertGreaterThanOrEqual(Self.ratio(.negativo, Self.on(.fundoApp), mode), 3, "\(mode)")
        }
    }
}

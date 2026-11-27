import SwiftUI
import UIKit
import XCTest
@testable import RepMileUI

/// #94: the launch screen's states (loading, operational error, damaged identity) in both appearances. The damaged identity is reached only
/// by the live composition, so the XCUITests cannot open it: each state is rendered here in light and in dark and its page colour checked.
/// An `ImageRenderer` ignores `preferredColorScheme`, so a pinned appearance is caught by the source scan below and by `AppearanceUITests`.
@MainActor
final class LaunchAppearanceTests: XCTestCase {
    private func render(_ phase: RepMileLaunchScreen.Phase, _ scheme: ColorScheme) throws -> UIImage {
        let renderer = ImageRenderer(content: RepMileLaunchScreen(phase: phase).environment(\.colorScheme, scheme).frame(width: 393, height: 852))
        renderer.scale = 2
        return try XCTUnwrap(renderer.uiImage, "\(phase) \(scheme)")
    }

    /// The colour at (x, y) points of a rendered image, as 0xRRGGBB.
    private func pixel(_ image: UIImage, x: Int, y: Int) -> UInt32 {
        guard let cg = image.cgImage, let crop = cg.cropping(to: CGRect(x: x * 2, y: y * 2, width: 1, height: 1)) else { return 0xDEAD }
        var px = [UInt8](repeating: 0, count: 4)
        let ctx = CGContext(data: &px, width: 1, height: 1, bitsPerComponent: 8, bytesPerRow: 4, space: CGColorSpaceCreateDeviceRGB(),
                            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        ctx?.draw(crop, in: CGRect(x: 0, y: 0, width: 1, height: 1))
        return UInt32(px[0]) << 16 | UInt32(px[1]) << 8 | UInt32(px[2])
    }

    private func close(_ a: UInt32, _ b: UInt32) -> Bool {
        let d = [16, 8, 0].map { abs(Int((a >> $0) & 0xFF) - Int((b >> $0) & 0xFF)) }
        return d.allSatisfy { $0 <= 3 }
    }

    func testLaunchStatesTakeTheSystemAppearance() throws {
        for phase in [RepMileLaunchScreen.Phase.opening, .failed(code: "HOST_UNAVAILABLE"), .identityDamaged] {
            for (scheme, page) in [(ColorScheme.light, RMColorToken.fundoApp.light >> 8), (.dark, RMColorToken.fundoApp.dark >> 8)] {
                let image = try render(phase, scheme)
                let edge = pixel(image, x: 4, y: 426)
                XCTAssertTrue(close(edge, page), "\(phase) \(scheme): page \(String(edge, radix: 16)), expected \(String(page, radix: 16))")
                let a = XCTAttachment(image: image); a.name = "launch \(phase) \(scheme)"; a.lifetime = .keepAlways; add(a)
            }
        }
    }

    /// The app follows the system appearance: no view pins one (the Figma has no in-app choice), and no colour is drawn outside the
    /// two-mode tokens. Scans RepMileUI's and the app target's sources (QRE #106 P3-3).
    func testNoViewPinsAnAppearanceOrDrawsARawColour() throws {
        let here = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        let roots = ["../../Sources/RepMileUI", "../../../../App/RepMile/Sources"].map { here.appendingPathComponent($0).standardized }
        var files: [URL] = []
        for root in roots {
            let found = try XCTUnwrap(FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil), root.path)
                .compactMap { $0 as? URL }.filter { $0.pathExtension == "swift" }
            XCTAssertFalse(found.isEmpty, "no sources found at \(root.path)")
            files += found
        }
        XCTAssertGreaterThan(files.count, 50)
        let pinned = [".preferredColorScheme(", ".colorScheme(.", ".environment(\\.colorScheme", ".toolbarColorScheme(", "overrideUserInterfaceStyle"]
        let raw = try NSRegularExpression(pattern: #"Color\.(white|black)\b|[(,:]\s*\.(white|black)\b|\b(Color|UIColor)\((red|white|hue|\.sRGB|hex)\b|0x[0-9A-Fa-f]{6,8}\b|#[0-9A-Fa-f]{6}\b"#)
        for file in files {
            let text = try String(contentsOf: file, encoding: .utf8)
            for p in pinned { XCTAssertFalse(text.contains(p), "\(file.lastPathComponent) pins an appearance: \(p)") }
            guard file.lastPathComponent != "PaletteTokens.swift" else { continue }
            let hits = raw.matches(in: text, range: NSRange(text.startIndex..., in: text)).compactMap { Range($0.range, in: text).map { String(text[$0]) } }
            XCTAssertTrue(hits.isEmpty, "\(file.lastPathComponent) draws a raw colour outside the tokens: \(hits)")
        }
    }
}

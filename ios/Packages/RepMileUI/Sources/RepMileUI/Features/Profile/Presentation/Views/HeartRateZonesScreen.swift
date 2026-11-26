import CoachingPresentation
import SwiftUI

/// Zonas de frequência cardíaca (Figma 71; default `1102:4302`, declared `760:1484`, custom `1102:4428`, strap `760:1611`, lab `760:1693`, none
/// `845:4225`). Exactly the engine's `heartRateFiveZones.zones` (`minBpm…maxBpm`), never recomputed; the percentage text uses the engine's own
/// `abovePercent`/`upToPercent` (absent for custom limits). The origin is always visible with "você pode informar a sua" (C3); Z1–Z5 names
/// only (C8); only ever a cue to slow down (C11). The bars sit on a 90 → maximum axis (addendum §4), positions from the engine's limits.
struct HeartRateZonesScreen: View {
    @Environment(AppModel.self) private var model
    @State private var editing: HeartRateZonesViewModel.Editor?

    private var calibration: RunCalibration? { model.presentation?.readings?.runCalibration }
    private var five: HeartRateFiveZones? { calibration?.heartRateFiveZones }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(L.t("hr.kicker")).rmText(.micro, RM.Palette.textoTerciario)
                Text(L.t("hr.title")).rmText(.manchete).accessibilityAddTraits(.isHeader)
                Text(L.t("hr.subtitle")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                content
                info(L.t("hr.slow.title"), L.t("hr.slow.body"))
                info(L.t("hr.three.title"), L.t("hr.three.body"))
                info(L.t("hr.nowatch.title"), L.t("hr.nowatch.body"))
                if model.plan?.hold == nil {
                    VStack(spacing: 0) {
                        Button { editing = .maximum } label: { ChevronRow(title: L.t("hr.enterMax"), detail: L.t("hr.enterMax.detail")).padding(16) }
                            .buttonStyle(.plain).accessibilityIdentifier("hr-enter-max")
                        RMDivider()
                        Button { editing = .limits } label: { ChevronRow(title: L.t("hr.customize"), detail: L.t("hr.customize.detail")).padding(16) }
                            .buttonStyle(.plain).accessibilityIdentifier("hr-customize")
                    }
                    .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                }
            }
            .padding(.horizontal, RM.Space.gutter)
            .padding(.bottom, 40)
        }
        .scrollIndicators(.hidden)
        .accessibilityIdentifier("screen-hr-zones")
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .navigationTitle("").navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(RM.Palette.fundoApp, for: .navigationBar)
        .sheet(item: $editing) {
            HeartRateProfileEditor(viewModel: HeartRateZonesViewModel(writer: model.writer, mode: $0, current: five, reload: { [model] in await model.load() }),
                                   current: five)
        }
    }

    @ViewBuilder private var content: some View {
        if let five, five.status.raw == "AVAILABLE", let zones = five.zones, let ref = five.reference {
            referenceCard(five, ref)
            Text(L.t("hr.yourZones")).rmText(.micro, RM.Palette.textoTerciario).padding(.top, 8)
            VStack(spacing: 14) {
                ForEach(Array(zones.enumerated()), id: \.offset) { i, z in ZoneRow(zone: z, index: i, maximum: ref.bpm) }
            }
            .accessibilityElement(children: .contain).accessibilityIdentifier("hr-zones")
        } else if let five {
            StateBanner(tone: .neutral, icon: .relogio, title: L.t("hr.unavailable"),
                        message: L.code("hr.unavailable", five.reason) ?? L.t("hr.unavailable"))
                .accessibilityIdentifier("hr-unavailable")
        } else if calibration != nil, !["DISABLED", "NOT_APPLICABLE"].contains(calibration?.status.raw ?? "") {
            // The run calibration answered but carries no five-zone key: computed before the amendment ("not computed", never "no zones").
            StateBanner(tone: .neutral, icon: .relogio, title: L.t("hr.unavailable"), message: L.t("hr.notComputed"))
        } else {
            StateBanner(tone: .neutral, icon: .relogio, title: L.t("hr.unavailable"), message: L.t("hr.unavailable"))
        }
    }

    private func referenceCard(_ f: HeartRateFiveZones, _ ref: HeartRateReference) -> some View {
        RMCard {
            HStack {
                Text(L.code("hr.chip", f.provenance) ?? "").rmText(.rotulo, RM.Palette.agoraSobre)
                    .padding(.horizontal, 10).padding(.vertical, 4).background(RM.Palette.agora, in: Capsule())
                if f.boundarySource?.raw == "ATHLETE_CUSTOM" {
                    Text(L.t("hr.chip.custom")).rmText(.rotulo).padding(.horizontal, 10).padding(.vertical, 4).background(RM.Palette.fundoElevado2, in: Capsule())
                }
                Spacer()
                Text(L.code("hr.ref.side", ref.kind) ?? "").rmText(.detalhe, RM.Palette.textoSecundario)
            }
            Text(ref.kind.raw == "AGE_ESTIMATE" ? L.f("hr.ref.AGE_ESTIMATE", ref.ageYears.map(String.init) ?? "", "\(ref.bpm)") : L.f("hr.ref." + ref.kind.raw, "\(ref.bpm)")).rmText(.subtitulo)
                .accessibilityIdentifier("hr-reference")
            ForEach(disclosures(f, ref), id: \.self) { Text($0).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
            ForEach(Array((f.notUsed ?? []).enumerated()), id: \.offset) { _, n in
                if let bpm = n.bpm, let kind = L.code("hr.kind", n.kind), n.reason.raw != "REFERENCE_CONFLICT" {
                    Text(L.f("hr.notUsed", kind.capitalizedFirst, "\(bpm)")).rmText(.detalhe, RM.Palette.textoTerciario)
                }
            }
        }
    }

    private func disclosures(_ f: HeartRateFiveZones, _ ref: HeartRateReference) -> [String] {
        var out: [String] = []
        if let d = L.code("hr.disclosure", ref.kind) { out.append(d) }
        if f.boundarySource?.raw == "ATHLETE_CUSTOM" { out.append(L.t("hr.disclosure.ATHLETE_CUSTOM")) }
        if f.disclosures?.contains(where: { $0.raw == "OPTICAL_MEASUREMENT" }) == true { out.append(L.t("hr.disclosure.OPTICAL_MEASUREMENT")) }
        if let c = f.conflict { out.append(L.f("hr.disclosure.REFERENCE_CONFLICT", "\(c.labMaxBpm)", "\(c.observedMaxBpm)")) }
        return out
    }

    private func info(_ title: String, _ body: String) -> some View {
        RMCard {
            Text(title).rmText(.subtitulo)
            Text(body).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
        }
    }
}

struct ZoneRow: View {
    let zone: FiveZone
    let index: Int
    let maximum: Int
    var body: some View {
        let color = RM.Palette.zonas[min(index, 4)]
        // Fractions of the 90…maximum axis, computed apart: as one expression inside the view builder, Swift 6.3 (the CI runner's
        // Xcode 26.6) gave up type-checking it ("unable to type-check this expression in reasonable time").
        let bar = Self.barFractions(minBpm: zone.minBpm, maxBpm: zone.maxBpm, maximum: maximum)
        return VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text(zone.zone.raw).rmText(.rotulo, RM.Palette.agoraSobre).frame(width: 28, height: 22).background(color, in: RoundedRectangle(cornerRadius: 6))
                Text(percentText).rmText(.detalhe, RM.Palette.textoSecundario)
                Spacer()
                Text(bpmText).rmText(.numeroS)
                Text("bpm").rmText(.detalhe, RM.Palette.textoSecundario)
            }
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(RM.Palette.fundoTrilho).frame(height: 4)
                    Capsule().fill(color)
                        .frame(width: max(4, g.size.width * bar.width), height: 4)
                        .offset(x: g.size.width * bar.start)
                }
                .frame(maxHeight: .infinity)
            }
            .frame(height: 8)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityText)
        .accessibilityIdentifier("hr-zone-\(zone.zone.raw)")
    }
    private var accessibilityText: String {
        let base = "\(zone.zone.raw), \(bpmText) bpm"
        return percentText.isEmpty ? base : "\(base), \(percentText)"
    }
    /// Where the zone's bar starts and how wide it is, as fractions of the axis 90 bpm … maximum (open ends at the axis limits).
    static func barFractions(minBpm: Int?, maxBpm: Int?, maximum: Int) -> (start: CGFloat, width: CGFloat) {
        let axisLow = 90.0
        let axisHigh = Double(max(maximum, 91))
        let span = axisHigh - axisLow
        let lo = max(Double(minBpm ?? 90), axisLow)
        let hi = min(Double(maxBpm ?? maximum), axisHigh)
        return (CGFloat((lo - axisLow) / span), CGFloat((hi - lo) / span))
    }
    private var bpmText: String {
        switch (zone.minBpm, zone.maxBpm) {
        case (nil, let hi?): L.f("hr.bpm.upTo", "\(hi)")
        case (let lo?, nil): L.f("hr.bpm.above", "\(lo - 1)")
        case (let lo?, let hi?): "\(lo)–\(hi)"
        default: ""
        }
    }
    /// The engine's own percentages; none for the athlete's custom limits.
    private var percentText: String {
        switch (zone.abovePercent, zone.upToPercent) {
        case (nil, let up?): L.f("hr.range.below", "\(up)")
        case (let a?, nil): L.f("hr.range.above", "\(a)")
        case (let a?, let up?): L.f("hr.range.between", "\(a)", "\(up)")
        default: ""
        }
    }
}

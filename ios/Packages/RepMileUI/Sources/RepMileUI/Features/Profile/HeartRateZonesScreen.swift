import CoachingPresentation
import SwiftUI

/// Zonas de frequência cardíaca (Figma 71; default `1102:4302`, declared `760:1484`, custom `1102:4428`, strap `760:1611`, lab `760:1693`, none
/// `845:4225`). Exactly the engine's `heartRateFiveZones.zones` (`minBpm…maxBpm`), never recomputed; the percentage text uses the engine's own
/// `abovePercent`/`upToPercent` (absent for custom limits). The origin is always visible with "você pode informar a sua" (C3); Z1–Z5 names
/// only (C8); only ever a cue to slow down (C11). The bars sit on a 90 → maximum axis (addendum §4), positions from the engine's limits.
struct HeartRateZonesScreen: View {
    @Environment(AppModel.self) private var model
    @State private var editing: Editor?
    enum Editor: String, Identifiable { case maximum, limits; var id: String { rawValue } }

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
        .sheet(item: $editing) { HeartRateProfileEditor(mode: $0, current: five) }
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
        let lo = Double(zone.minBpm ?? 90), hi = Double(zone.maxBpm ?? maximum)
        let axis = (90.0, Double(max(maximum, 91)))
        VStack(alignment: .leading, spacing: 8) {
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
                        .frame(width: max(4, g.size.width * CGFloat((min(hi, axis.1) - max(lo, axis.0)) / (axis.1 - axis.0))), height: 4)
                        .offset(x: g.size.width * CGFloat((max(lo, axis.0) - axis.0) / (axis.1 - axis.0)))
                }
                .frame(maxHeight: .infinity)
            }
            .frame(height: 8)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(zone.zone.raw + ", " + bpmText + " bpm" + (percentText.isEmpty ? "" : ", " + percentText))
        .accessibilityIdentifier("hr-zone-\(zone.zone.raw)")
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

/// Informar a máxima / personalizar limites: `setHeartRateProfile` (validation is the engine's answer: `fields`); erase inside the sheet
/// (`eraseHeartRateProfile`, never held back by consent).
struct HeartRateProfileEditor: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    let mode: HeartRateZonesScreen.Editor
    let current: HeartRateFiveZones?
    @State private var maximum = ""
    @State private var limits = ["", "", "", ""]
    @State private var message: (text: String, ok: Bool)?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if mode == .maximum {
                        field(L.t("hr.max.field"), $maximum, id: "hr-max-field")
                    } else {
                        ForEach(0..<4, id: \.self) { i in field(L.f("hr.limit.field", "Z\(i + 1)"), $limits[i], id: "hr-limit-\(i + 1)") }
                    }
                    if let m = message { Text(m.text).rmText(.detalhe, m.ok ? RM.Palette.positivo : RM.Palette.negativo).accessibilityIdentifier("hr-message") }
                    PrimaryActionButton(L.t("hr.save"), icon: .check, enabled: request != nil) { Task { await save() } }.accessibilityIdentifier("hr-save")
                    if current?.profile?.declaredMaximumBpm != nil || current?.profile?.customZoneUpperBpm != nil || current?.boundarySource?.raw == "ATHLETE_CUSTOM" || current?.reference?.kind.raw == "ATHLETE_DECLARED_MAXIMUM" {
                        Button(role: .destructive) { Task { await erase() } } label: { Text(L.t("hr.erase")).rmText(.rotulo, RM.Palette.negativo) }
                            .accessibilityIdentifier("hr-erase")
                    }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(mode == .maximum ? L.t("hr.enterMax") : L.t("hr.customize")).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
        .onAppear {
            if let m = current?.profile?.declaredMaximumBpm { maximum = "\(m)" }
            if let z = current?.profile?.customZoneUpperBpm, z.count == 4 { limits = z.map(String.init) }
        }
    }

    private func field(_ label: String, _ text: Binding<String>, id: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).rmText(.detalhe, RM.Palette.textoSecundario)
            TextField("", text: text).keyboardType(.numberPad).rmText(.numeroM)
                .padding(12).background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 12)).accessibilityIdentifier(id)
        }
    }

    /// Whole numbers only; the range and order are the engine's to judge (its `fields` come back on refusal).
    var request: HeartRateProfileRequest? {
        if mode == .maximum { return Int(maximum).map { HeartRateProfileRequest(maxHeartRateBpm: .some($0)) } }
        let v = limits.compactMap(Int.init)
        return v.count == 4 ? HeartRateProfileRequest(zoneUpperBpm: .some(v)) : nil
    }

    private func save() async {
        guard let r = request else { return }
        switch await model.writer.setHeartRateProfile(r) {
        case .success: message = (L.t("hr.saved"), true)
        case .failure(let e):
            if e.code.raw == "CONSENT_REQUIRED" { message = (L.t("hr.error.consent"), false) }
            else { message = ((e.fields ?? []).compactMap { L.code("hr.error", Code(raw: $0)) }.first ?? L.t("state.opError.body"), false) }
        }
    }

    private func erase() async {
        switch await model.writer.eraseHeartRateProfile() {
        case .success: message = (L.t("hr.erased"), true)
        case .failure: message = (L.t("state.opError.body"), false)
        }
    }
}

import SwiftUI

/// Etapa 3 · Você, second half, and the start of etapa 4 (Figma 10): 23 Resultado recente (and "não tenho" `838:1143`), 24 Como foi o resultado,
/// 25 Força até aqui (and iniciante `838:1187`), 27 Cuidados (`836:3299`, `838:3616`), 29 Seus dados (`837:999`). 26 Cargas conhecidas is held (D01).
extension OnboardingFormView {
    @ViewBuilder var startContent: some View {
        switch vm.step {
        case .result: result
        case .resultDetail: resultDetail
        case .strengthYears:
            OBQuestion(stage: 3, title: L.t("ob.strengthYears.title"))
            OBPills(items: TrainingBand.allCases.map { ($0.rawValue, L.t("ob.band.\($0.rawValue)")) },
                    selected: Set([vm.draft.strengthBand?.rawValue].compactMap { $0 })) { vm.draft.strengthBand = TrainingBand(rawValue: $0) }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            if vm.draft.strengthBand == .never {
                // Shown only while true (OBCopyDeviation, SSCTR C1).
                if OBCopyDeviation.showsPracticeNote(vm.draft) { OBFootnote(text: L.t("ob.strengthYears.never.note")) }
            } else if vm.draft.strengthBand != nil {
                // "Do Apple Saúde · últimas 4 semanas" is not shown: nothing comes from Apple Health yet (D15).
                OBGroup {
                    OBCounterRow(title: L.t("ob.strengthYears.days"), value: $vm.draft.recentStrengthDays, range: 0...7, unit: L.t("ob.unit.days"), id: "ob-strength-days")
                }
                .padding(.top, 16)
            }
        case .care: care
        case .dataUse: dataUse
        default: EmptyView()
        }
    }

    // MARK: 23 (`836:2994`, `838:1143`)

    @ViewBuilder private var result: some View {
        OBQuestion(stage: 3, title: L.t("ob.result.title"),
                   subtitle: vm.draft.hasResult == false || !OBCopyDeviation.showsPaceBandPromise(vm.draft) ? nil : L.t("ob.result.body"))
        if vm.draft.hasResult == false {
            VStack(alignment: .leading, spacing: 10) {
                OBPills(items: [("none", L.t("ob.result.none"))], selected: ["none"]) { _ in }
                OBPills(items: [("add", L.t("ob.result.add"))], selected: []) { _ in vm.draft.hasResult = nil }
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            OBFootnote(text: L.t("ob.result.none.note"))
        } else {
            OBPills(items: RaceDistance.allCases.map { ($0.rawValue, L.t("ob.race.\($0.rawValue)")) },
                    selected: Set([vm.draft.resultDistance?.rawValue].compactMap { $0 })) { id in
                vm.draft.resultDistance = RaceDistance(rawValue: id); vm.draft.hasResult = true
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            OBWheelCard {
                OBWheelColumn(values: Array(0...59), selection: $vm.draft.resultMinutes, label: { "\($0)" }, unit: L.t("ob.unit.min"), id: "ob-result-min")
                OBWheelColumn(values: Array(0...59), selection: $vm.draft.resultSeconds, label: { String(format: "%02d", $0) }, unit: L.t("ob.unit.s"), id: "ob-result-s")
            }
            .padding(.top, 16)
            .onChange(of: [vm.draft.resultMinutes, vm.draft.resultSeconds]) { if vm.draft.resultMinutes != nil { vm.draft.hasResult = true } }
        }
    }

    // MARK: 24 (`836:3049`)

    private var resultDetail: some View {
        VStack(alignment: .leading, spacing: 0) {
            OBQuestion(stage: 3, title: L.f("ob.resultDetail.title", vm.draft.resultDistance.map(OBText.race) ?? ""))
            VStack(alignment: .leading, spacing: 14) {
                label("ob.resultDetail.when")
                ResultDayField(day: $vm.draft.resultDay, latest: vm.today)
                label("ob.resultDetail.measured")
                OBSegmented(items: ResultMeasure.allCases.map { ($0.rawValue, L.t("ob.resultDetail.\($0.rawValue)")) }, selected: vm.draft.resultMeasure?.rawValue) {
                    vm.draft.resultMeasure = ResultMeasure(rawValue: $0)
                }
                label("ob.resultDetail.effort")
                OBEffortDots(value: $vm.draft.resultEffort)
                label("ob.resultDetail.tolerated")
                OBSegmented(items: [("yes", L.t("ob.resultDetail.yes")), ("no", L.t("ob.resultDetail.no"))],
                            selected: vm.draft.resultTolerated.map { $0 ? "yes" : "no" }) { vm.draft.resultTolerated = $0 == "yes" }
                label("ob.resultDetail.conditions")
                OBSegmented(items: ResultConditions.allCases.map { ($0.rawValue, L.t("ob.resultDetail.\($0.rawValue)")) }, selected: vm.draft.resultConditions?.rawValue) {
                    vm.draft.resultConditions = ResultConditions(rawValue: $0)
                }
            }
            .padding(16)
            .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            OBFootnote(text: L.t("ob.resultDetail.note"))
        }
    }

    private func label(_ key: String) -> some View { Text(L.t(key)).rmText(.rotulo, RM.Palette.textoSecundario) }

    // MARK: 27 Cuidados

    @ViewBuilder private var care: some View {
        OBQuestion(stage: 3, title: L.t("ob.care.title"))
        OBGroup {
            ForEach(Array(CareItem.allCases.enumerated()), id: \.element) { i, item in
                if i > 0 { RMDivider() }
                OBCheckRow(title: L.t("ob.care.\(item.rawValue)"), checked: vm.draft.care.contains(item), id: "ob-care-\(item.rawValue)") { vm.draft.toggleCare(item) }
            }
        }
        .padding(.top, 20)
        OBOptionCard(title: L.t("ob.care.none"), selected: vm.draft.careNone, id: "ob-care-none") { vm.draft.chooseNoCare() }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 12)
        OBFootnote(text: OBCopyDeviation.showOnlyInYourAccount ? L.t("ob.care.note") + " " + L.t("ob.care.note.account") : L.t("ob.care.note"), icon: .cadeado)
    }

    // MARK: 29 Seus dados

    @ViewBuilder private var dataUse: some View {
        OBQuestion(stage: 4, title: L.t("ob.data.title"), subtitle: L.t("ob.data.body"))
        OBGroup {
            OBConsentRow(title: L.t("ob.data.training"), detail: L.t("ob.data.training.detail"), id: "ob-consent-COACHING")
            RMDivider()
            OBConsentRow(title: L.t("ob.data.health"), detail: L.t("ob.data.health.detail"), isOn: $vm.draft.consentHealthSignals, id: "ob-consent-HEALTH_SIGNALS")
            RMDivider()
            OBConsentRow(title: L.t("ob.data.learning"), detail: L.t("ob.data.learning.detail"), isOn: $vm.draft.consentLearning, id: "ob-consent-LEARNING")
        }
        .padding(.top, 20)
        OBFootnote(text: L.t("ob.data.note"), icon: .cadeado)
    }
}

/// 24 "Quando": the day reads "Domingo, 18 de outubro" (or "—"); a tap opens the system calendar in a sheet, opened on the day already chosen
/// (else today) and kept only with "Concluir" (Figma 09b's button), so today can be chosen too. Days up to today only.
struct ResultDayField: View {
    @Binding var day: String?
    let latest: String
    @State private var choosing = false
    @State private var picked = Date()

    var body: some View {
        Button { picked = Self.date(day ?? latest); choosing = true } label: {
            HStack(spacing: 8) {
                Text(day.map(OBText.dateReading) ?? "—").rmText(.subtitulo).lineLimit(2).minimumScaleFactor(0.8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                RMIconView(.chevronBaixo, size: 14).foregroundStyle(RM.Palette.textoSecundario)
            }
            .padding(.horizontal, 14).padding(.vertical, 12).frame(minHeight: 48)
            .background(RM.Palette.fundoElevado2, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(L.t("ob.resultDetail.when")).accessibilityValue(day.map(OBText.dateReading) ?? "—").accessibilityIdentifier("ob-result-day")
        .sheet(isPresented: $choosing) {
            VStack(spacing: 12) {
                DatePicker("", selection: $picked, in: ...Self.date(latest), displayedComponents: .date)
                    .datePickerStyle(.graphical).labelsHidden().tint(RM.Palette.corrida).accessibilityIdentifier("ob-result-day-picker")
                OBPrimaryButton(title: L.t("ob.done"), id: "ob-result-day-done") { day = Fmt.deviceDay(picked); choosing = false }
            }
            .padding(RM.Space.gutter)
            .presentationDetents([.large]).presentationBackground(RM.Palette.fundoElevado)
        }
    }

    /// Noon of a plan-local day in the device's calendar (a day, never shifted by the time zone).
    static func date(_ day: String) -> Date {
        let p = day.split(separator: "-").compactMap { Int($0) }
        return p.count == 3 ? Calendar.current.date(from: DateComponents(year: p[0], month: p[1], day: p[2], hour: 12)) ?? Date() : Date()
    }
}

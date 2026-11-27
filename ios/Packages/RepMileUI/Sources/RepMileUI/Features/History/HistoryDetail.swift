import CoachingPresentation
import SwiftUI

/// One history row in full: every voice (each with done, minutes, stop, distances), sets and loads as logged, and the distance correction
/// (its state and write live in `HistoryCorrectionViewModel`). The correction asks the eligibility screen with it (the engine records no
/// report without a current one); an answer that asks for the warning-sign screen opens "Não estou 100%" from the banner, as the run report.
/// #70: the engine's correction limit is said as such (never "send again"), and a plan day that cannot be read at send time keeps the draft.
struct HistoryDetail: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: HistoryCorrectionViewModel
    let title: String
    /// "Não estou 100%" with the eligibility screen, for the banner's action.
    let signs: () -> NotFeeling100ViewModel
    @State private var showSigns = false

    init(viewModel: HistoryCorrectionViewModel, title: String, signs: @escaping () -> NotFeeling100ViewModel) {
        _viewModel = State(initialValue: viewModel); self.title = title; self.signs = signs
    }

    private var entry: LoggedEntry { viewModel.entry }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text(Fmt.longDay(entry.date)).rmText(.detalhe, RM.Palette.textoSecundario)
                    if entry.unplannedMerge { StateBanner(tone: .milestone, icon: .marco, title: title, message: L.t("history.merged")) }
                    Text(L.t("history.voices")).rmText(.micro, RM.Palette.textoTerciario)
                    ForEach(Array(entry.voices.enumerated()), id: \.offset) { _, v in voice(v) }
                    if let ex = entry.exercises, !ex.isEmpty {
                        ForEach(ex, id: \.id) { e in
                            VStack(alignment: .leading, spacing: 2) {
                                Text(L.code("exercise", Code(raw: e.id)) ?? e.id).rmText(.subtitulo)
                                Text(e.sets.map { s in [s.reps.map { "\($0)" }, s.load.map { $0.unit.raw == "BODYWEIGHT" ? L.t("load.BODYWEIGHT") : Fmt.number($0.value, fraction: 1) + " " + $0.unit.raw.lowercased() }]
                                    .compactMap { $0 }.joined(separator: " × ") }.joined(separator: " · ")).rmText(.detalhe, RM.Palette.textoSecundario)
                            }
                        }
                    }
                    if viewModel.canContest { contestBlock }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(title).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
        .sheet(isPresented: $showSigns) { NotFeeling100Flow(viewModel: signs()) }
        .accessibilityElement(children: .contain).accessibilityIdentifier("history-detail")
    }

    private func voice(_ v: LoggedVoice) -> some View {
        RMCard {
            Text(L.t("history.voice." + v.channel.raw)).rmText(.subtitulo)
            Text(([v.completed ? L.t("today.card.done") : L.t("history.notDone")] + [v.minutes.map { L.f("common.minutes", Fmt.minutes($0)) }].compactMap { $0 })
                .joined(separator: " · ")).rmText(.detalhe, RM.Palette.textoSecundario)
            ForEach(DistanceText.lines(measured: v.measuredKm, declared: v.declaredKm, contested: nil, measurement: v.measurement), id: \.self) { Text($0).rmText(.detalhe, RM.Palette.textoSecundario) }
            if let s = L.code("stop", v.stopReason) { Text(L.f("history.stopped", s)).rmText(.detalhe, RM.Palette.negativo) }
            if let r = v.rpe { Text(L.t("report.rpe") + ": " + Fmt.number(r)).rmText(.detalhe, RM.Palette.textoSecundario) }
        }
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("history-voice-\(v.channel.raw)")
    }

    @ViewBuilder private var contestBlock: some View {
        @Bindable var vm = viewModel
        switch viewModel.phase {
        case .saved, .notKept:
            let sent = viewModel.phase == .saved
            // A clinical route is not "send again" (SSCTR #59 P2-2): only its banner, never an invitation to withdraw the answer.
            if viewModel.limitReached {
                Text(L.t("history.contest.limit")).rmText(.detalhe, RM.Palette.negativo).fixedSize(horizontal: false, vertical: true)
                    .accessibilityIdentifier("contest-limit")
            } else if sent || !viewModel.clinical {
                Text(sent ? L.t("report.saved") : L.t("report.notKept")).rmText(.detalhe, sent ? RM.Palette.positivo : RM.Palette.negativo)
            }
            if let g = viewModel.clinicalGuidance {
                ClinicalRouteBanner(reportKept: true, guidance: g).accessibilityIdentifier("contest-blocked")
            }
            if viewModel.screenRequired {
                StateBanner(tone: .safety, icon: .lista, title: L.t("state.screenRequired.title"), message: L.t("screen.required"),
                            actionTitle: L.t("state.screenRequired.action")) { showSigns = true }
                    .accessibilityIdentifier("contest-screen-required")
            }
        case .editing, .submitting:
            RMCard {
                Text(L.t("history.contest.title")).rmText(.subtitulo)
                Text(L.t("history.contest.body")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                TextField(L.t("history.contest.km"), text: $vm.km).keyboardType(.decimalPad).rmText(.numeroS)
                    .padding(10).background(RM.Palette.fundoElevado2, in: RoundedRectangle(cornerRadius: 8)).accessibilityIdentifier("contest-km")
                Picker("", selection: $vm.reason) { ForEach(DeclaredDistanceReason.allCases, id: \.self) { Text(L.t("reason." + $0.rawValue)).tag($0) } }
                    .pickerStyle(.menu).tint(RM.Palette.textoPrimario)
                EligibilityForm(screen: $vm.eligibility)
                Text(L.t("ob.eligibility.body")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                if viewModel.dayUnavailable {
                    Text(L.t("history.contest.noDay")).rmText(.detalhe, RM.Palette.negativo).fixedSize(horizontal: false, vertical: true)
                        .accessibilityIdentifier("contest-no-day")
                }
                PrimaryActionButton(L.t("history.contest.send"), icon: .check, enabled: viewModel.canSend) { Task { await viewModel.send { change in withAnimation { change() } } } }
                    .accessibilityIdentifier("contest-send")
            }
        case .idle:
            SecondaryPillButton(L.t("history.contest"), icon: .gps) { viewModel.startContesting() }.accessibilityIdentifier("history-contest")
        }
    }
}

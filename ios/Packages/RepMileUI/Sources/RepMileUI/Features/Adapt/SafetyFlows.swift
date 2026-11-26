import CoachingPresentation
import SwiftUI

/// The signs the engine asks, one yes/no each (Figma 72 `843:1751` / `843:1980`: 9, 13 or 15 are variants of this one component). Only the
/// asked signs exist; an unanswered one stays unanswered ("Sem resposta não conta como não") and is omitted from the request.
struct SignQuestionnaire: View {
    let title: String
    let signs: [String]
    @Binding var answers: [String: Bool]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title).rmText(.titulo).fixedSize(horizontal: false, vertical: true)
            Text(L.f("signs.progress", "\(signs.filter { answers[$0] != nil }.count)", "\(signs.count)") + " · " + L.t("signs.noAnswerIsNotNo"))
                .rmText(.detalhe, RM.Palette.textoSecundario).accessibilityIdentifier("signs-progress")
            ForEach(signs, id: \.self) { sign in
                HStack(spacing: 10) {
                    Text(L.code("sign", Code(raw: sign)) ?? sign).rmText(.corpo).frame(maxWidth: .infinity, alignment: .leading).fixedSize(horizontal: false, vertical: true)
                    YesNo(value: Binding(get: { answers[sign] }, set: { answers[sign] = $0 }), id: "sign-\(sign)")
                }
                .padding(.vertical, 6)
                RMDivider()
            }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("signs-\(signs.count)")
    }
}

/// A three-state yes/no: nil until the athlete answers.
struct YesNo: View {
    @Binding var value: Bool?
    let id: String
    var body: some View {
        HStack(spacing: 6) {
            pill(L.t("answer.no"), value == false) { value = false }.accessibilityIdentifier(id + "-no")
            pill(L.t("answer.yes"), value == true) { value = true }.accessibilityIdentifier(id + "-yes")
        }
    }
    private func pill(_ t: String, _ on: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(t).rmText(.rotulo, on ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                .frame(width: 56, height: 36).background(on ? RM.Palette.agora : RM.Palette.fundoElevado2, in: Capsule())
        }
        .buttonStyle(.plain).accessibilityAddTraits(on ? .isSelected : [])
    }
}

/// The eligibility screen sent with a flow that needs `eligibility.currentAssessment` (GAP-20): six flags, nil until answered (never false
/// by default), and the athlete's nonclinical confirmation.
struct EligibilityForm: View {
    @Binding var screen: EligibilityScreen
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.t("eligibility.title")).rmText(.titulo)
            row("pain", \.pain); row("persistentPain", \.persistentPain); row("injury", \.injury)
            row("illness", \.illness); row("functionalLimitation", \.functionalLimitation); row("clinicalConcern", \.clinicalConcern)
            Toggle(isOn: Binding(get: { screen.status == .nonclinicalConfirmed }, set: { screen.status = $0 ? .nonclinicalConfirmed : nil })) {
                Text(L.t("eligibility.confirm.interim")).rmText(.corpo).fixedSize(horizontal: false, vertical: true)
            }
            .tint(RM.Palette.corrida)
            // Only when every flag is answered and none is "sim": the athlete confirms none applies, never judges what is clinical.
            .disabled(!allNo)
            .accessibilityIdentifier("eligibility-confirm")
        }
    }
    private var allNo: Bool {
        [screen.pain, screen.persistentPain, screen.injury, screen.illness, screen.functionalLimitation, screen.clinicalConcern].allSatisfy { $0 == false }
    }
    private func row(_ key: String, _ path: WritableKeyPath<EligibilityScreen, Bool?>) -> some View {
        HStack {
            Text(L.t("eligibility." + key)).rmText(.corpo).frame(maxWidth: .infinity, alignment: .leading)
            YesNo(value: Binding(get: { screen[keyPath: path] }, set: { screen[keyPath: path] = $0; if $0 != false { screen.status = nil } }), id: "eligibility-\(key)")
        }
    }
}

/// "Não estou 100%" (Figma 72; F08 Situation 1). Condition → the engine's signs for it → (eligibility, when asked by the entry point) → the
/// intents the engine accepts for it → submit. The answer decides; the UI shows its state (BLOCKED, ASK, kept).
struct NotFeeling100Flow: View {
    enum Outcome: Equatable { case kept, modified, blocked, needsAnswers, failed(String) }
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    var requireEligibility = false
    @State private var condition: WellbeingCondition?
    @State private var set: WarningSignQuestionSet?
    @State private var answers: [String: Bool] = [:]
    @State private var eligibility = EligibilityScreen(status: nil, assessedAt: "", pain: nil, persistentPain: nil, injury: nil, illness: nil, functionalLimitation: nil, clinicalConcern: nil)
    @State private var intent: WellbeingIntent?
    @State private var outcome: Outcome?
    @State private var sending = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if let outcome { outcomeView(outcome) } else if let set { questions(set) } else { conditions }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(L.t("nf.title")).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("flow-not-feeling-100")
    }

    private var conditions: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.t("nf.condition")).rmText(.manchete)
            ForEach(WellbeingCondition.allCases, id: \.self) { c in
                Button { Task { await choose(c) } } label: {
                    ChevronRow(title: L.t("condition." + c.rawValue), detail: nil).padding(.vertical, 12)
                }
                .buttonStyle(.plain).accessibilityIdentifier("condition-\(c.rawValue)")
                RMDivider()
            }
        }
    }

    @ViewBuilder private func questions(_ set: WarningSignQuestionSet) -> some View {
        SignQuestionnaire(title: L.t("signs.title"), signs: set.warningSigns, answers: $answers)
        if requireEligibility { EligibilityForm(screen: $eligibility) }
        VStack(alignment: .leading, spacing: 10) {
            Text(L.t("nf.intent")).rmText(.titulo)
            ForEach(set.intents.compactMap(WellbeingIntent.init(rawValue:)), id: \.self) { i in
                Button { intent = i } label: {
                    HStack {
                        Text(L.t("intent." + i.rawValue)).rmText(.corpo)
                        Spacer()
                        if intent == i { RMIconView(.check, size: 16).foregroundStyle(RM.Palette.positivo) }
                    }
                    .padding(.vertical, 10)
                }
                .buttonStyle(.plain).accessibilityIdentifier("intent-\(i.rawValue)")
            }
        }
        PrimaryActionButton(L.t("nf.send"), icon: .check, enabled: !sending) { Task { await send(set) } }
            .accessibilityIdentifier("nf-send")
    }

    @ViewBuilder private func outcomeView(_ o: Outcome) -> some View {
        switch o {
        case .kept: StateBanner(tone: .neutral, icon: .check, title: L.t("nf.title"), message: L.t("nf.kept")).accessibilityIdentifier("nf-kept")
        case .modified: StateBanner(tone: .neutral, icon: .repetir, title: L.t("nf.title"), message: L.t("nf.modified")).accessibilityIdentifier("nf-modified")
        case .blocked: StateBanner(tone: .safety, icon: .pausa, title: L.t("state.blocked.title"), message: L.t("state.blocked.body.interim")).accessibilityIdentifier("nf-blocked")
        case .needsAnswers: StateBanner(tone: .neutral, icon: .lista, title: L.t("state.needsInput.title"), message: L.t("nf.needsAnswers")).accessibilityIdentifier("nf-needs-answers")
        case .failed(let c): StateBanner(tone: .neutral, icon: .repetir, title: L.t("state.opError.title"), message: c == "CONFLICT_STALE_VERSION" ? L.t("state.stale.body") : L.t("state.opError.body"))
        }
        SecondaryPillButton(L.t("common.close")) { dismiss() }
    }

    /// The engine's answer, read without guessing: only KEEP is "the plan stays"; an unknown status fails closed.
    static func outcome(_ a: BoundaryAnswer) -> Outcome {
        guard a.ok else { return .failed(a.error?.code.raw ?? "UNKNOWN") }
        if a.view?.state == .blocked || a.status?.raw == "CLINICAL_HUMAN_REQUIRED" { return .blocked }
        switch a.status?.raw {
        case "ASK": return .needsAnswers
        case "KEEP": return .kept
        case "MODIFY": return .modified
        default: return .failed(a.status?.raw ?? "UNRECOGNIZED")
        }
    }

    private func choose(_ c: WellbeingCondition) async {
        condition = c
        if case .success(let s) = await model.reader.warningSignSet(condition: c.rawValue) { answers = [:]; set = s }
    }

    /// The request exactly as the shared types encode it (asked signs only; unanswered omitted; eligibility only when the flow asked it).
    func request(_ set: WarningSignQuestionSet) -> ReviewRequest? {
        guard let condition else { return nil }
        return Self.makeRequest(condition: condition, set: set, answers: answers, intent: intent,
                                eligibility: requireEligibility ? eligibility : nil, today: model.plan?.today ?? Fmt.deviceDay(Date()))
    }

    /// Asked signs only (a sign outside the engine's set is refused by `SignAnswers`), unanswered omitted, eligibility dated today.
    static func makeRequest(condition: WellbeingCondition, set: WarningSignQuestionSet, answers: [String: Bool], intent: WellbeingIntent?,
                            eligibility: EligibilityScreen?, today: String) -> ReviewRequest? {
        guard var decl = try? WellbeingDeclaration(condition: condition, set: set, intent: intent) else { return nil }
        for (k, v) in answers { try? decl.warningSigns.answer(k, v) }
        var e = eligibility; e?.assessedAt = today
        return ReviewRequest(.notFeeling100(decl, reports: []), eligibility: e)
    }

    private func send(_ set: WarningSignQuestionSet) async {
        guard let r = request(set) else { return }
        sending = true; defer { sending = false }
        let out = await model.writer.submit(r)
        withAnimation {
            outcome = Self.outcome(out.answer)
        }
    }
}

/// The readiness declaration (the only exit of a clinical hold): the READINESS set (15 signs), "recovered", and sport by sport.
struct ReadinessFlow: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var set: WarningSignQuestionSet?
    @State private var answers: [String: Bool] = [:]
    @State private var recovered: Bool?
    @State private var run = false
    @State private var strength = false
    @State private var done: Bool?
    @State private var needsAnswers = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if needsAnswers {
                        StateBanner(tone: .neutral, icon: .lista, title: L.t("state.needsInput.title"), message: L.t("nf.needsAnswers"))
                            .accessibilityIdentifier("readiness-needs-answers")
                        SecondaryPillButton(L.t("ob.back")) { needsAnswers = false }
                    } else if let done {
                        StateBanner(tone: done ? .neutral : .safety, icon: done ? .repetir : .pausa,
                                    title: done ? L.t("state.returning.title") : L.t("state.blocked.title"),
                                    message: done ? L.t("state.returning.body") : L.t("state.blocked.body.interim"))
                            .accessibilityIdentifier(done ? "readiness-returning" : "readiness-still-blocked")
                        SecondaryPillButton(L.t("common.close")) { dismiss() }
                    } else if let set {
                        HStack {
                            Text(L.t("readiness.recovered")).rmText(.titulo).frame(maxWidth: .infinity, alignment: .leading)
                            YesNo(value: $recovered, id: "readiness-recovered")
                        }
                        SignQuestionnaire(title: L.t("signs.title"), signs: set.warningSigns, answers: $answers)
                        Toggle(isOn: $run) { Text(L.t("readiness.run")).rmText(.corpo) }.tint(RM.Palette.corrida)
                        Toggle(isOn: $strength) { Text(L.t("readiness.strength")).rmText(.corpo) }.tint(RM.Palette.forca)
                        Text(L.t("readiness.note.interim")).rmText(.detalhe, RM.Palette.textoSecundario)
                        PrimaryActionButton(L.t("nf.send"), icon: .check, enabled: recovered != nil) { Task { await send(set) } }
                            .accessibilityIdentifier("readiness-send")
                    }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(L.t("readiness.title")).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
        .task { if case .success(let s) = await model.reader.warningSignSet(condition: "READINESS") { set = s } }
        .accessibilityElement(children: .contain).accessibilityIdentifier("flow-readiness")
    }

    func request(_ set: WarningSignQuestionSet) -> ReviewRequest? {
        guard let recovered, var decl = try? ReadinessDeclaration(declaredRecovered: recovered, set: set,
                                                                  sports: .init(run: .init(ready: run), strength: .init(ready: strength, restrictions: []))) else { return nil }
        for (k, v) in answers { try? decl.warningSigns.answer(k, v) }
        return ReviewRequest(.readiness(decl, reports: []), eligibility: nil)
    }

    private func send(_ set: WarningSignQuestionSet) async {
        guard let r = request(set) else { return }
        let out = await model.writer.submit(r)
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            if out.answer.status?.raw == "ASK" || out.answer.view?.state == .needsInput { needsAnswers = true; return }
            // Returning only when the engine restarts training; anything else keeps the hold on screen (fail closed).
            done = out.answer.ok && (out.answer.action?.raw == "READINESS_RESTART" || out.answer.view?.state == .returning)
        }
    }
}

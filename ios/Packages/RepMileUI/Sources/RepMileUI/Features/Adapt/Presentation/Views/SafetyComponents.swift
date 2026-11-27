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

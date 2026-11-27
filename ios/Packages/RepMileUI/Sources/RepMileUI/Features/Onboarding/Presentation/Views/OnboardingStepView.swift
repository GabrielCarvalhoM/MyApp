import CoachingPresentation
import SwiftUI

/// The body of one onboarding step (Figma page 10). It edits the draft only; continuing, going back and sending belong to
/// `OnboardingViewModel`.
struct OnboardingStepView: View {
    let step: OnboardingViewModel.Step
    @Binding var draft: OnboardingDraft
    @State private var choosingEventDate = false

    var body: some View {
        switch step {
        case .welcome:
            // Figma `835:2069` (#99): the week strip, the wordmark, the V1 headline and body. "Já tenho conta" is not shown: there is no
            // account layer in V1 yet (#28), and a link with no destination would be worse (accepted difference).
            WeekStripArt().padding(.horizontal, -RM.Space.gutter).padding(.top, 64)
            VStack(alignment: .leading, spacing: 10) {
                RMWordmark()
                Text(L.t("ob.welcome.title")).rmText(.manchete).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
                Text(L.t("ob.welcome.body")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
        case .age:
            Text(L.t("ob.age.title")).rmText(.manchete)
            TextField(L.t("ob.age.placeholder"), text: $draft.ageText).keyboardType(.numberPad).rmText(.numeroL)
                .padding(14).background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 14)).accessibilityIdentifier("ob-age")
            Text(L.t("ob.age.note")).rmText(.detalhe, RM.Palette.textoSecundario)
        case .goals:
            Text(L.t("ob.goal.title")).rmText(.manchete)
            choices(["RACE", "PERFORMANCE", "REGULAR", "GENERAL"], selected: draft.runGoal, prefix: "goal.run") { draft.runGoal = $0 }
            if draft.runGoal == "RACE" {
                Text(L.t("ob.event.title")).rmText(.titulo)
                chips(["5K", "10K", "HALF_MARATHON", "MARATHON"], selected: [draft.eventKind], prefix: "event") { draft.eventKind = $0 }
                eventDateButton
            }
            Text(L.t("ob.strength.title")).rmText(.titulo)
            choices(["RUNNING_SUPPORT", "STRENGTH", "HYPERTROPHY", "MAINTAIN", "GENERAL"], selected: draft.strengthGoal, prefix: "goal.strength") { draft.strengthGoal = $0 }
        case .experience:
            Text(L.t("ob.experience.title")).rmText(.manchete)
            number(L.t("ob.runMonths"), $draft.runMonths, 0...240)
            number(L.t("ob.strengthMonths"), $draft.strengthMonths, 0...240)
            Text(L.t("ob.recent.title")).rmText(.titulo)
            number(L.t("ob.runDays"), $draft.runDaysPerWeek, 0...7)
            number(L.t("ob.runMinutes"), $draft.runMinutesPerWeek, 0...900, step: 10)
            number(L.t("ob.longest"), $draft.longestRun, 0...300, step: 5)
            number(L.t("ob.strengthDays"), $draft.strengthDaysPerWeek, 0...7)
        case .schedule:
            Text(L.t("ob.schedule.title")).rmText(.manchete)
            Text(L.t("ob.schedule.run")).rmText(.rotulo, RM.Palette.textoSecundario)
            weekdays(draft.runDays) { d in if draft.runDays.contains(d) { draft.runDays.remove(d) } else { draft.runDays.insert(d) } }
            Text(L.t("ob.schedule.strength")).rmText(.rotulo, RM.Palette.textoSecundario)
            weekdays(draft.strengthDays) { d in if draft.strengthDays.contains(d) { draft.strengthDays.remove(d) } else { draft.strengthDays.insert(d) } }
            Text(L.t("ob.schedule.long")).rmText(.rotulo, RM.Palette.textoSecundario)
            weekdays([draft.longRunDay]) { draft.longRunDay = $0 }
            number(L.t("ob.schedule.runMinutes"), $draft.runMinutes, 15...180, step: 5)
            number(L.t("ob.schedule.longMinutes"), $draft.longRunMinutes, 20...240, step: 5)
            number(L.t("ob.schedule.strengthMinutes"), $draft.strengthMinutes, 15...120, step: 5)
            Text(L.t("ob.schedule.runTurn")).rmText(.rotulo, RM.Palette.textoSecundario)
            chips(["AM", "PM"], selected: [draft.runTurn], prefix: "turn.short") { draft.runTurn = $0 }
            Text(L.t("ob.schedule.strengthTurn")).rmText(.rotulo, RM.Palette.textoSecundario)
            chips(["AM", "PM"], selected: [draft.strengthTurn], prefix: "turn.short") { draft.strengthTurn = $0 }
            Text(L.t("ob.weeks")).rmText(.rotulo, RM.Palette.textoSecundario)
            FlowChips(items: ["4", "8", "12", "16"].map { ($0, L.f("ob.weeks.value", $0)) }, selected: Set(draft.weeks.map { ["\($0)"] } ?? [])) {
                draft.weeks = Int($0)
            }
        case .equipment:
            Text(L.t("ob.equipment.title")).rmText(.manchete)
            chips(["DUMBBELLS", "BENCH", "BARBELL", "RACK", "KETTLEBELL", "MACHINES", "BANDS", "PULL_UP_BAR"], selected: draft.equipment, prefix: "equipment") { e in
                if draft.equipment.contains(e) { draft.equipment.remove(e) } else { draft.equipment.insert(e) }
            }
        case .anchor:
            Text(L.t("ob.anchor.title")).rmText(.manchete)
            Text(L.t("ob.anchor.body")).rmText(.corpo, RM.Palette.textoSecundario)
            Toggle(isOn: $draft.hasAnchor) { Text(L.t("ob.anchor.add")).rmText(.subtitulo) }.tint(RM.Palette.corrida).accessibilityIdentifier("ob-anchor-toggle")
            if draft.hasAnchor {
                chips(["5K", "10K", "HALF_MARATHON", "MARATHON"], selected: [draft.anchorDistance], prefix: "event") { draft.anchorDistance = $0 }
                TextField(L.t("ob.anchor.time"), text: $draft.anchorTime).keyboardType(.numbersAndPunctuation).rmText(.numeroM)
                    .padding(12).background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 12)).accessibilityIdentifier("ob-anchor-time")
                DatePicker(L.t("ob.anchor.date"), selection: $draft.anchorDate, in: ...Date(), displayedComponents: .date).tint(RM.Palette.corrida)
            }
        case .care:
            Text(L.t("ob.care.title")).rmText(.manchete)
            Text(L.t("ob.care.body")).rmText(.corpo, RM.Palette.textoSecundario)
            VStack(spacing: 8) {
                careOption(.pregnancy, "care.PREGNANCY"); careOption(.postpartum, "care.POSTPARTUM"); careOption(.noneOfThese, "care.none")
            }
            Text(L.t("ob.eligibility.body")).rmText(.detalhe, RM.Palette.textoSecundario).padding(.top, 8)
            EligibilityForm(screen: $draft.eligibility)
        case .consents:
            Text(L.t("ob.consents.title")).rmText(.manchete)
            Text(L.t("ob.consents.body")).rmText(.corpo, RM.Palette.textoSecundario)
            ForEach(ConsentPurpose.allCases, id: \.self) { p in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(L.t("profile.consent." + p.rawValue)).rmText(.subtitulo).frame(maxWidth: .infinity, alignment: .leading)
                        YesNo(value: Binding(get: { draft.consents[p] }, set: { draft.consents[p] = $0 }), id: "consent-\(p.rawValue)")
                    }
                    Text(L.t("profile.consent." + p.rawValue + ".detail")).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                RMDivider()
            }
        }
    }

    /// The race date: none until the athlete picks one (#61); the calendar opens in a sheet and nothing is kept until "Usar esta data".
    private var eventDateButton: some View {
        Button { choosingEventDate = true } label: {
            HStack {
                Text(L.t("ob.event.date")).rmText(.corpo, RM.Palette.textoSecundario)
                Spacer()
                Text(draft.eventDate.map { Fmt.longDay(Fmt.deviceDay($0)) } ?? L.t("ob.event.date.choose"))
                    .rmText(.subtitulo, draft.eventDate == nil ? RM.Palette.corrida : RM.Palette.textoPrimario)
                RMIconView(.chevronDireita, size: 14).foregroundStyle(RM.Palette.textoTerciario)
            }
            .padding(14).background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain).accessibilityIdentifier("ob-event-date")
        .sheet(isPresented: $choosingEventDate) { EventDateSheet(initial: draft.eventDate) { draft.eventDate = $0 } }
    }

    private func careOption(_ c: OnboardingDraft.Care, _ key: String) -> some View {
        Button { draft.care = c } label: {
            HStack {
                Text(L.t(key)).rmText(.subtitulo, draft.care == c ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                Spacer()
                if draft.care == c { RMIconView(.check, size: 16).foregroundStyle(RM.Palette.agoraSobre) }
            }
            .padding(16).background(draft.care == c ? RM.Palette.agora : RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain).accessibilityAddTraits(draft.care == c ? .isSelected : []).accessibilityIdentifier("ob-" + key)
    }

    private func choices(_ codes: [String], selected: String, prefix: String, pick: @escaping (String) -> Void) -> some View {
        VStack(spacing: 8) {
            ForEach(codes, id: \.self) { c in
                Button { pick(c) } label: {
                    HStack {
                        Text(L.t(prefix + "." + c)).rmText(.corpo, selected == c ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                        Spacer()
                    }
                    .padding(14).background(selected == c ? RM.Palette.agora : RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 14))
                }
                .buttonStyle(.plain).accessibilityAddTraits(selected == c ? .isSelected : []).accessibilityIdentifier("ob-\(prefix)-\(c)")
            }
        }
    }

    private func chips(_ codes: [String], selected: Set<String>, prefix: String?, pick: @escaping (String) -> Void) -> some View {
        FlowChips(items: codes.map { code in (code, prefix.map { p in L.t(p + "." + code) } ?? code) }, selected: selected, pick: pick)
    }

    private func weekdays(_ selected: Set<Int>, toggle: @escaping (Int) -> Void) -> some View {
        HStack(spacing: 6) {
            ForEach(0..<7, id: \.self) { d in
                Button { toggle(d) } label: {
                    Text(L.t("weekday.\(d)")).rmText(.rotulo, selected.contains(d) ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                        .frame(maxWidth: .infinity, minHeight: 40).background(selected.contains(d) ? RM.Palette.agora : RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain).accessibilityAddTraits(selected.contains(d) ? .isSelected : [])
            }
        }
    }

    private func number(_ label: String, _ value: Binding<Int>, _ range: ClosedRange<Int>, step: Int = 1) -> some View {
        Stepper(value: value, in: range, step: step) {
            HStack { Text(label).rmText(.corpo, RM.Palette.textoSecundario); Spacer(); Text("\(value.wrappedValue)").rmText(.numeroS) }
        }
    }
}

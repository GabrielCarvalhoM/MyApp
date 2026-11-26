import CoachingPresentation
import SwiftUI

/// Treino planejado · força (strength reference `662:…` "Corpo inteiro"): loads only from `prescription.load` with no suggested number
/// (GAP-10); "Anterior" from `loggedEntries`. Shown by `SessionDetailView` when nothing is paused.
struct SessionStrengthDetail: View {
    @Environment(AppModel.self) private var model
    let session: PlannedSession
    let prescription: Prescription

    var body: some View {
        let p = prescription
        let exercises = p.exercises ?? []
        MetricGrid(items: [
            p.durationMinutes.map { MetricGrid.Item(value: L.f("common.minutes", Fmt.minutes($0)), label: L.t("session.duration")) },
            MetricGrid.Item(value: "\(exercises.count)", label: L.t("session.label.exercises")),
            MetricGrid.Item(value: "\(exercises.reduce(0) { $0 + $1.sets })", label: L.t("session.label.sets")),
            L.code("turn.short", session.turn).map { MetricGrid.Item(value: $0, label: L.t("session.turn")) },
        ].compactMap { $0 }).padding(.top, 20)
        Text(L.f("session.exercises", "\(exercises.count)")).rmText(.micro, RM.Palette.textoTerciario).padding(.top, 24)
        VStack(spacing: 0) {
            ForEach(exercises, id: \.id) { e in
                ExerciseRow(exercise: e, previous: previousLoad(e.id))
                if e.id != exercises.last?.id { RMDivider() }
            }
        }
        .padding(.top, 8)
        .accessibilityElement(children: .contain).accessibilityIdentifier("session-exercises")
    }

    /// The athlete's last logged working load for this exercise (the record, never the engine): "Anterior".
    private func previousLoad(_ id: String) -> String? {
        let rows = (model.logged?.entries ?? []).filter { !$0.superseded && $0.date < session.date }.sorted { $0.date > $1.date }
        for r in rows {
            if let set = r.exercises?.first(where: { $0.id == id })?.sets.last, let load = set.load {
                if load.unit.raw == "BODYWEIGHT" { return L.t("load.BODYWEIGHT") }
                return Fmt.number(load.value, fraction: 1) + " " + load.unit.raw.lowercased() + (set.reps.map { " × \($0)" } ?? "")
            }
        }
        return nil
    }
}

struct ExerciseRow: View {
    let exercise: PrescribedExercise
    let previous: String?
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline) {
                Text(L.code("exercise", Code(raw: exercise.id)) ?? exercise.id).rmText(.subtitulo)
                Spacer()
                Text(L.f("session.setsReps", "\(exercise.sets)", exercise.reps.map(String.init) ?? "–")).rmText(.numeroS)
            }
            Text(detail).rmText(.detalhe, RM.Palette.textoSecundario)
            if let previous { Text(L.f("session.previous", previous)).rmText(.detalhe, RM.Palette.textoTerciario) }
        }
        .padding(.vertical, 12)
        .accessibilityElement(children: .combine)
    }
    private var detail: String {
        var parts: [String] = []
        if let load = exercise.load {
            if load.mode.raw == "KNOWN", let v = load.value {
                parts.append(Fmt.number(v, fraction: 1) + " " + (load.unit?.raw.lowercased() ?? "") + (L.code("convention", load.convention).map { " " + $0 } ?? ""))
            } else if let copy = L.code("load", load.mode) { parts.append(copy) }
        }
        if let rir = exercise.rir { parts.append(L.f("session.rir", Fmt.number(rir))) }
        if let rest = exercise.restSeconds { parts.append(L.f("session.rest", Fmt.clock(rest))) }
        return parts.joined(separator: " · ")
    }
}

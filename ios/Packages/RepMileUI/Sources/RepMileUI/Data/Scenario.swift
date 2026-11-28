import CoachingPresentation
import Foundation

/// A synthetic scenario of the parallel phase: which committed capture answers each read port, and the host-side state that is not the
/// engine's (Startability, pending reports, Apple Health status). Combines fixture files; never edits one (handoff C §4).
public struct Scenario: Sendable, Identifiable, Hashable {
    public enum Read: Sendable, Hashable {
        /// A capture with `{ok:true, <key>}`.
        case file(String)
        /// A capture with `{ok:false, error}` replayed as the port's failure.
        case failure(String)
        /// A host failure the engine never captures (A's own codes, e.g. INTEGRITY_FAILURE, HOST_UNAVAILABLE): a Swift port fixture.
        case hostFailure(String)
    }
    /// What front A answers for a session that the plan view does prescribe (the view's `executable` stays necessary: see `startability`).
    public enum HostGate: Sendable, Hashable {
        case none
        case notStartable(NotStartableReason)
    }

    public let id: String
    public let title: String
    public let plan: Read
    public let allWeeks: Read
    public let presentation: Read
    public let history: Read
    public let logged: Read
    public let weekPlan: Read
    public let hostGate: HostGate
    public let pendingReports: Int
    public let healthQueued: Int

    public static func == (a: Scenario, b: Scenario) -> Bool { a.id == b.id }
    public func hash(into h: inout Hasher) { h.combine(id) }

    /// The host's answer, as front A will compute it: the engine's `executable` first, then the native gate of this scenario.
    public func startability(of session: PlannedSession?) -> Startability {
        guard let session else { return .notStartable(reason: .notExecutable) }
        if session.projected { return .notStartable(reason: .projected) }
        guard session.executable, session.prescription != nil else { return .notStartable(reason: .notExecutable) }
        switch hostGate {
        case .none: return .startable
        case .notStartable(let r): return .notStartable(reason: r)
        }
    }
}

public extension Scenario {
    private static let base = (allWeeks: Read.file("03-sessions"), history: Read.file("20-history"), weekPlan: Read.file("P-week-plan"))

    /// Week 0, Sunday: the long run is today and not yet logged (the record holds only Tuesday's run, `P-logged-two-voices`).
    static let today = Scenario(id: "today", title: "Plano válido · domingo do longão", plan: .file("13-plan-w1"), allWeeks: base.allWeeks,
                                presentation: .file("12-presentation-after-w0"), history: base.history, logged: .file("P-logged-two-voices"),
                                weekPlan: base.weekPlan, hostGate: .none, pendingReports: 0, healthQueued: 0)
    /// The same Sunday after the week was logged (`P-logged-after-w0`): the day is done, one session reported as not done.
    static let weekDone = Scenario(id: "week-done", title: "Semana registrada · dia concluído", plan: .file("13-plan-w1"), allWeeks: base.allWeeks,
                                   presentation: .file("12-presentation-after-w0"), history: .file("26-history-final"), logged: .file("P-logged-after-w0"),
                                   weekPlan: base.weekPlan, hostGate: .none, pendingReports: 0, healthQueued: 0)
    /// History variants: unplanned runs merged by the engine (FND-ABC-01), a contested measured distance, an unplanned strength row.
    static let historyUnplanned = Scenario(id: "history-unplanned", title: "Histórico · avulsas e distância corrigida", plan: .file("13-plan-w1"), allWeeks: base.allWeeks,
                                           presentation: .file("unplanned-8-presentation"), history: .file("unplanned-7-history"), logged: .file("P-logged-unplanned"),
                                           weekPlan: base.weekPlan, hostGate: .none, pendingReports: 0, healthQueued: 0)
    /// A symptom stop against a completed device run: one row, both voices (QRE-ABC-01).
    static let historyConflict = Scenario(id: "history-conflict", title: "Histórico · vozes em conflito", plan: .file("13-plan-w1"), allWeeks: base.allWeeks,
                                          presentation: .file("12-presentation-after-w0"), history: base.history, logged: .file("P-logged-conflict"),
                                          weekPlan: base.weekPlan, hostGate: .none, pendingReports: 0, healthQueued: 0)
    /// The eve of the first week (plan created, nothing logged yet).
    /// #101: Lucas (`837:1144`) right after the onboarding, read from the real engine's record (`Captures/lucas-*`): 8 weeks to the 10 km of
    /// Sunday 20 Dec, calibrated by the 5 km in 21:48, 3 strength days. Screens 31–34 in the fixture composition.
    static let lucasOnboarded = Scenario(id: "lucas-onboarded", title: "Cadastro · Lucas, 8 semanas até os 10 km", plan: .file("lucas-plan"), allWeeks: .file("lucas-sessions"),
                                         presentation: .file("lucas-presentation"), history: base.history, logged: .file("lucas-logged"),
                                         weekPlan: .file("lucas-week-plan"), hostGate: .none, pendingReports: 0, healthQueued: 0)
    static let firstWeek = Scenario(id: "first-week", title: "Plano criado · véspera da semana 1", plan: .file("02-plan-w0"), allWeeks: base.allWeeks,
                                    presentation: .file("04-presentation-after-onboard"), history: base.history, logged: .file("P-logged-two-voices"),
                                    weekPlan: base.weekPlan, hostGate: .none, pendingReports: 0, healthQueued: 0)
    /// A warning sign raised a clinical hold: no prescription, no steps, only the readiness declaration.
    static let blocked = Scenario(id: "blocked", title: "Bloqueado · sinal de alerta", plan: .file("17-plan-blocked"), allWeeks: .file("17c-sessions-blocked"),
                                  presentation: .file("17b-presentation-blocked"), history: base.history, logged: .file("P-logged-after-w0"),
                                  weekPlan: base.weekPlan, hostGate: .notStartable(.blocked), pendingReports: 0, healthQueued: 0)
    /// #73: the hold an urgent sign raised (`Captures/plan-blocked-urgent`: hold.guidance URGENT_CARE_ADVISED, the real engine).
    static let blockedUrgent = Scenario(id: "blocked-urgent", title: "Bloqueado · sinal de alerta urgente", plan: .file("plan-blocked-urgent"),
                                        allWeeks: .file("17c-sessions-blocked"), presentation: .file("17b-presentation-blocked"), history: base.history,
                                        logged: .file("P-logged-after-w0"), weekPlan: base.weekPlan, hostGate: .notStartable(.blocked), pendingReports: 0, healthQueued: 0)
    /// An erasure of health facts is never readiness: still BLOCKED.
    static let blockedAfterErase = Scenario(id: "blocked-erase", title: "Bloqueado · depois de apagar dados", plan: .file("actions-F3-plan-after-erase"),
                                            allWeeks: .file("17c-sessions-blocked"), presentation: .file("17b-presentation-blocked"), history: base.history,
                                            logged: .file("P-logged-after-w0"), weekPlan: base.weekPlan, hostGate: .notStartable(.blocked), pendingReports: 0, healthQueued: 0)
    static let returning = Scenario(id: "returning", title: "Retorno · depois da prontidão", plan: .file("19-plan-after-readiness"), allWeeks: base.allWeeks,
                                    presentation: .file("12-presentation-after-w0"), history: base.history, logged: .file("P-logged-after-w0"),
                                    weekPlan: base.weekPlan, hostGate: .none, pendingReports: 0, healthQueued: 0)
    static let pending = Scenario(id: "pending", title: "Mudança aguardando você", plan: .file("actions-A2b-plan-after-substitution"), allWeeks: base.allWeeks,
                                  presentation: .file("actions-B1b-presentation-pending"), history: base.history, logged: .file("P-logged-two-voices"),
                                  weekPlan: base.weekPlan, hostGate: .none, pendingReports: 0, healthQueued: 0)
    /// A planned run stopped for a symptom: the plan is valid but A holds every start until the screen is answered.
    static let screenRequired = Scenario(id: "screen-required", title: "Triagem pendente depois de parar", plan: .file("actions-C2-plan-after-symptom-stop"),
                                         allWeeks: base.allWeeks, presentation: .file("04-presentation-after-onboard"), history: base.history,
                                         logged: .file("P-logged-conflict"), weekPlan: base.weekPlan, hostGate: .notStartable(.screenRequired), pendingReports: 0, healthQueued: 0)
    /// FND-ABC-04: a restart declared pregnancy/postpartum; the earlier plan stays in the record but nothing starts (screen `1103:2299`).
    static let restartOutsideScope = Scenario(id: "restart-outside-scope", title: "Recadastro fora do escopo da V1", plan: .file("13-plan-w1"),
                                              allWeeks: base.allWeeks, presentation: .file("12-presentation-after-w0"), history: base.history,
                                              logged: .file("P-logged-two-voices"), weekPlan: base.weekPlan, hostGate: .notStartable(.outsideV1Scope), pendingReports: 0, healthQueued: 0)
    static let clockUntrusted = Scenario(id: "clock", title: "Relógio do aparelho não confiável", plan: .file("13-plan-w1"), allWeeks: base.allWeeks,
                                         presentation: .file("12-presentation-after-w0"), history: base.history, logged: .file("P-logged-two-voices"),
                                         weekPlan: base.weekPlan, hostGate: .notStartable(.clockUntrusted), pendingReports: 2, healthQueued: 1)
    static let notEnrolled = Scenario(id: "no-data", title: "Sem plano (novo atleta)", plan: .failure("23-error-not-enrolled"), allWeeks: .failure("23-error-not-enrolled"),
                                      presentation: .failure("23-error-not-enrolled"), history: .failure("23-error-not-enrolled"), logged: .failure("23-error-not-enrolled"),
                                      weekPlan: .failure("23-error-not-enrolled"), hostGate: .none, pendingReports: 0, healthQueued: 0)
    static let accountErased = Scenario(id: "gone", title: "Conta apagada", plan: .failure("actions-F5-plan-after-account-erase"), allWeeks: .failure("actions-F5-plan-after-account-erase"),
                                        presentation: .failure("actions-F5-plan-after-account-erase"), history: .failure("actions-F5-plan-after-account-erase"),
                                        logged: .failure("actions-F5-plan-after-account-erase"), weekPlan: .failure("actions-F5-plan-after-account-erase"),
                                        hostGate: .none, pendingReports: 0, healthQueued: 0)
    static let staleVersion = Scenario(id: "stale", title: "Erro operacional · versão desatualizada", plan: .failure("22-error-stale-version"), allWeeks: base.allWeeks,
                                       presentation: .file("12-presentation-after-w0"), history: base.history, logged: .file("P-logged-after-w0"),
                                       weekPlan: base.weekPlan, hostGate: .none, pendingReports: 0, healthQueued: 0)
    static let integrityFailure = Scenario(id: "integrity", title: "Falha de integridade do registro", plan: .hostFailure("INTEGRITY_FAILURE"), allWeeks: .hostFailure("INTEGRITY_FAILURE"),
                                           presentation: .hostFailure("INTEGRITY_FAILURE"), history: .hostFailure("INTEGRITY_FAILURE"), logged: .hostFailure("INTEGRITY_FAILURE"),
                                           weekPlan: .hostFailure("INTEGRITY_FAILURE"), hostGate: .none, pendingReports: 0, healthQueued: 0)
    static let recordLost = Scenario(id: "record-lost", title: "Registro perdido", plan: .hostFailure("RECORD_LOST"), allWeeks: .hostFailure("RECORD_LOST"),
                                     presentation: .hostFailure("RECORD_LOST"), history: .hostFailure("RECORD_LOST"), logged: .hostFailure("RECORD_LOST"),
                                     weekPlan: .hostFailure("RECORD_LOST"), hostGate: .none, pendingReports: 0, healthQueued: 0)

    /// Heart-rate zone variants (Figma 71): the plan of `today` with the presentation captured for each five-zone reading.
    static func zones(_ name: String) -> Scenario {
        Scenario(id: "zones-" + name, title: "Zonas de FC · " + name, plan: .file(name == "hold" ? "17-plan-blocked" : "13-plan-w1"), allWeeks: base.allWeeks,
                 presentation: .file("hr5r-\(name)-presentation"), history: base.history, logged: .file("P-logged-two-voices"), weekPlan: base.weekPlan,
                 hostGate: name == "hold" ? .notStartable(.blocked) : .none, pendingReports: 0, healthQueued: 0)
    }
    static let zoneVariants = ["age30", "declared", "custom", "strap-above", "strap-below", "lab", "conflict", "noage", "hold", "optical", "after-erase"]

    static let all: [Scenario] = zoneVariants.map(zones) + [.today, .weekDone, .historyUnplanned, .historyConflict, .firstWeek, .lucasOnboarded, .blocked, .blockedUrgent, .blockedAfterErase, .returning, .pending, .screenRequired, .restartOutsideScope,
                                  .clockUntrusted, .notEnrolled, .accountErased, .staleVersion, .integrityFailure, .recordLost]

    static func named(_ id: String?) -> Scenario { all.first { $0.id == id } ?? .today }
}

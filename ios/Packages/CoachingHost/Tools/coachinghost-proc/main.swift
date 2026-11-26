// coachinghost-proc: a second (third, ...) macOS process for the cross-process tests of the CoachingHost (N-5 lock, the HR5 two-writer race,
// persistence between processes). Test tool only, never shipped. It opens the REAL host (native file store, Keychain anchor, the production
// Keychain integrity key under a test prefix) and answers one JSON line per command read from stdin:
//   {"cmd":"enroll","startDate":"YYYY-MM-DD"} | {"cmd":"setMax","bpm":Int} | {"cmd":"setLimits","limits":[Int x4]} | {"cmd":"hr"} (reference
//   kind/bpm/declared of the five-zone reading) | {"cmd":"hrIds"} (event ids of the athlete's heart-rate declarations on record) |
//   {"cmd":"version"} | {"cmd":"exit"}
// Arguments: --root <dir> --prefix <keychain prefix> --athlete <id> --wall <epoch ms, fixed wall clock>
import Foundation
@_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation

#if COACHINGHOST_TESTING
final class FixedWall: HostClockSource, @unchecked Sendable {
    let ms: Double; let device = DeviceClock()
    init(_ ms: Double) { self.ms = ms }
    func wallMs() -> Double { ms }
    func continuousNanos() -> UInt64 { device.continuousNanos() }
    func bootSession() -> String { device.bootSession() }
}
func arg(_ n: String) -> String? { let a = CommandLine.arguments; return a.firstIndex(of: n).flatMap { $0 + 1 < a.count ? a[$0 + 1] : nil } }
func emit(_ o: [String: Any]) { var o = o; o["pid"] = Int(getpid()); let d = try! JSONSerialization.data(withJSONObject: o, options: [.sortedKeys]); print(String(data: d, encoding: .utf8)!); fflush(stdout) }

let root = URL(fileURLWithPath: arg("--root")!), prefix = arg("--prefix")!, athlete = arg("--athlete")!, wall = Double(arg("--wall") ?? "1794668400000")!
let sem = DispatchSemaphore(value: 0)
Task {
    do {
        let host = try await CoachingHost.openForTesting(.init(athleteId: athlete, root: root), keychainPrefix: prefix, clock: FixedWall(wall))
        emit(["ready": true])
        while let line = readLine() {
            guard let c = try? JSONSerialization.jsonObject(with: Data(line.utf8)) as? [String: Any], let cmd = c["cmd"] as? String else { emit(["error": "bad command"]); continue }
            switch cmd {
            case "enroll":
                let screen = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: c["assessedAt"] as? String ?? "2026-11-13", pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false)
                let a = OnboardingAnswers(athlete: AthleteIntake(id: athlete, ageYears: 32, eligibility: screen, specialPopulation: [], strengthTrainingMonths: 18, runTrainingMonths: 36,
                    exerciseRotationPreference: "COACH_DECIDES", goals: IntakeGoals(run: RunGoal(kind: "RACE", event: GoalEvent(kind: "10K", date: "2027-01-10")), strength: "RUNNING_SUPPORT"),
                    equipment: ["BARBELL", "RACK", "BENCH", "DUMBBELLS", "KETTLEBELL", "MACHINES", "BANDS", "PULL_UP_BAR"],
                    recent: RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 80),
                    performanceAnchors: [PerformanceAnchor(kind: "RACE_RESULT", distance: "10K", seconds: 3000, date: "2026-11-01", measurement: "OFFICIAL", rpe: 9, tolerated: true)]),
                    schedule: TrainingSchedule(strengthDays: [2, 5], strengthMinutes: 45, runDays: [1, 3, 5, 6], runMinutes: 50, longRunMinutes: 90, longRunDay: 6, runTurn: "AM", strengthTurn: "PM"),
                    weeks: 8, startDate: c["startDate"] as? String ?? "2026-11-16")
                let o = await host.onboard(a, consents: Consents(coaching: true, healthSignals: true, learning: true))
                emit(["ok": o.answer.ok, "status": o.answer.status?.raw ?? o.answer.error?.code.raw ?? "-"])
            case "setMax", "setLimits":
                let p = cmd == "setMax" ? HeartRateProfileRequest(maxHeartRateBpm: .some(c["bpm"] as? Int)) : HeartRateProfileRequest(zoneUpperBpm: .some(c["limits"] as? [Int]))
                switch await host.setHeartRateProfile(p) {
                case .success(let r): emit(["ok": r.ok, "added": r.heartRateProfile?.added ?? [], "unchanged": r.heartRateProfile?.unchanged ?? []])
                case .failure(let e): emit(["ok": false, "code": e.code.raw])
                }
            case "hr":
                switch await host.presentation() {
                case .success(let p): let z = p.readings?.runCalibration?.heartRateFiveZones
                    emit(["ok": true, "kind": z?.reference?.kind.raw ?? "-", "bpm": z?.reference?.bpm ?? -1, "declared": z?.profile?.declaredMaximumBpm ?? -1])
                case .failure(let e): emit(["ok": false, "code": e.code.raw])
                }
            case "hrIds": emit(["ok": true, "ids": await host.heartRateDeclarationIdsForTesting()])
            case "version": emit(["ok": true, "version": await host.versionForTesting() ?? -1])
            case "arm": await host.armFaultForTesting(c["fault"] as? String ?? ""); emit(["armed": c["fault"] as? String ?? ""])
            case "screen":
                // An athlete review with only the screen, under a FIXED request id (the retry of the same action after a death).
                let day = c["day"] as? String ?? "2026-11-17"
                let json = #"{"kind":"WEEKLY_REVIEW","observations":[],"eligibility":{"status":"NONCLINICAL_CONFIRMED","assessedAt":"\#(day)","pain":false,"persistentPain":false,"injury":false,"illness":false,"functionalLimitation":false,"clinicalConcern":false}}"#
                let o = await host.submitRawForTesting(json, requestId: c["rid"] as? String, screened: true)
                emit(["ok": o.answer.ok, "replayed": o.answer.replayed ?? false, "version": o.answer.version ?? -1, "code": o.answer.error?.code.raw ?? "-", "cleaned": await host.cleanedAtStartForTesting()])
            case "restartPostpartum":
                let screen = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "2026-11-14", pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false)
                let a = OnboardingAnswers(athlete: AthleteIntake(id: athlete, ageYears: 32, eligibility: screen, specialPopulation: [.postpartum], strengthTrainingMonths: 18, runTrainingMonths: 36,
                    exerciseRotationPreference: "COACH_DECIDES", goals: IntakeGoals(run: RunGoal(kind: "RACE", event: GoalEvent(kind: "10K", date: "2027-01-10")), strength: "RUNNING_SUPPORT"),
                    equipment: ["BARBELL", "RACK", "BENCH", "DUMBBELLS", "KETTLEBELL", "MACHINES", "BANDS", "PULL_UP_BAR"],
                    recent: RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 80),
                    performanceAnchors: [PerformanceAnchor(kind: "RACE_RESULT", distance: "10K", seconds: 3000, date: "2026-11-01", measurement: "OFFICIAL", rpe: 9, tolerated: true)]),
                    schedule: TrainingSchedule(strengthDays: [2, 5], strengthMinutes: 45, runDays: [1, 3, 5, 6], runMinutes: 50, longRunMinutes: 90, longRunDay: 6, runTurn: "AM", strengthTurn: "PM"),
                    weeks: 8, startDate: "2026-11-23")
                let o = await host.restart(a)
                emit(["ok": o.answer.ok, "status": o.answer.status?.raw ?? o.answer.error?.code.raw ?? "-"])
            case "startability":
                let ids = ((try? await host.allWeeks().get()) ?? []).flatMap(\.sessions).filter(\.executable).map(\.id)
                var rs: [String] = []; for id in ids { rs.append("\(await host.startability(sessionId: id))") }
                emit(["ok": true, "executable": ids.count, "startability": Array(Set(rs)).sorted()])
            case "exit": emit(["bye": true]); exit(0)
            default: emit(["error": "unknown command"])
            }
        }
    } catch { emit(["error": "\(error)"]) }
    sem.signal()
}
sem.wait()
#else
print("coachinghost-proc is a test tool: build it in debug (COACHINGHOST_TESTING)"); exit(2)
#endif

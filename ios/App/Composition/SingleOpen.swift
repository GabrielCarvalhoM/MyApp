import Foundation

/// Opens a value at most once per process: every caller, concurrent or later, gets the same instance. A failed open is forgotten, so the
/// operational-error state's "try again" opens again; a successful one is kept for the life of the process.
///
/// This is how the composition keeps #49 P2-1: exactly ONE `CoachingHost` (and one `HealthKitIngestor`, one `RunRecorder`) per athlete per
/// process, whatever SwiftUI re-creates or re-runs (`.task` again, a second scene).
@MainActor
final class SingleOpen<Value: AnyObject> {
    private var task: Task<Value, Error>?
    private var generation = 0

    init() {}

    func value(_ open: @escaping @MainActor () async throws -> Value) async throws -> Value {
        if let task { return try await task.value }
        generation += 1
        let mine = generation
        let t = Task { @MainActor in try await open() }
        task = t
        do { return try await t.value } catch {
            if generation == mine { task = nil }
            throw error
        }
    }
}

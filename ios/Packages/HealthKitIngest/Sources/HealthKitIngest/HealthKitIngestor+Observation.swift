import Foundation
import IntegrationContracts

// The HealthKit observer, background delivery and what an observer notification does. Moved out of `HealthKitIngestor.swift` and changed
// for QRE-B P3-3 (the switch turned off while they are being registered) and QRE-B-R2-03 (the delivery inside a background window).

extension HealthKitIngestor {
    /// Whether the observer and background delivery should be registered now.
    var wantsObservation: Bool { loaded && !storeUnreadable && state.enabled }

    /// Brings the observer and background delivery in line with the athlete's switch (P3-3). One pass at a time: a caller arriving during a
    /// pass asks for one more and waits for it, so `setEnabled(false)` returns only once nothing is left registered, whatever pass was
    /// running. Every await is followed by a fresh look at the switch. Waiting is safe: the reader is HealthKit, it never calls A, and an
    /// observer notification it starts runs in its own task.
    func syncObservation() async {
        if syncingObservation {
            syncObservationAgain = true
            await withCheckedContinuation { observationWaiters.append($0) }
            return
        }
        syncingObservation = true
        repeat {
            syncObservationAgain = false
            if wantsObservation { await registerObservation() } else { await unregisterObservation() }
        } while syncObservationAgain
        syncingObservation = false
        let waiters = observationWaiters; observationWaiters = []
        for w in waiters { w.resume() }
    }

    private func registerObservation() async {
        guard !observing else { return }
        do {
            try await reader.startObserving { [weak self] in
                guard let self else { return }
                await self.observerFired()
            }
            observing = true
        } catch let e as HealthReadError { noteReadError(e.code) } catch { noteReadError("OBSERVER_FAILED") }
        // Turned off during the await: the next pass undoes what this one registered.
        guard wantsObservation else { syncObservationAgain = true; return }
        // Registration only: an observed background wake-up is a separate fact (BACKGROUND_DELIVERY_ON_DEVICE), never inferred from this.
        do { try await reader.setBackgroundDelivery(true); log.log(.init(.backgroundDelivery, code: "REGISTERED")) }
        catch let e as HealthReadError { log.log(.init(.backgroundDelivery, code: e.code)); noteReadError(e.code) }
        catch { log.log(.init(.backgroundDelivery, code: "BACKGROUND_DELIVERY_FAILED")); noteReadError("BACKGROUND_DELIVERY_FAILED") }
        if !wantsObservation { syncObservationAgain = true }
    }

    /// Always both calls (idempotent): a crash between the switch's write and these calls is repaired at the next launch.
    private func unregisterObservation() async {
        await reader.stopObserving(); observing = false
        do { try await reader.setBackgroundDelivery(false) }
        catch let e as HealthReadError { log.log(.init(.backgroundDelivery, code: "DISABLE_" + e.code)) }
        catch { log.log(.init(.backgroundDelivery, code: "DISABLE_FAILED")) }
        if wantsObservation { syncObservationAgain = true }
    }

    /// The observer's completion handler runs when this returns: after the read is durably queued, not after the delivery to A
    /// (background-delivery time budget, QRE-B-08). Before returning it asks for a background window (QRE-B-R2-03), held by the delivery
    /// task until the delivery loop it joins has ended (also one already running), so iOS does not suspend the app in the middle.
    func observerFired() async {
        log.log(.init(.observerFired))
        await read(waitForRunningRead: true)
        let window = await backgroundWindow.begin("hki.deliver")
        log.log(.init(.backgroundWindow, code: window.grant.rawValue))
        observerPump = Task {
            await self.pump(waitForRunning: true)
            window.end()
            self.log.log(.init(.backgroundWindow, code: window.expired ? "EXPIRED" : "ENDED"))
        }
    }

    /// Tests: waits for the delivery an observer notification started.
    func settled() async { while let t = observerPump { observerPump = nil; await t.value } }
}

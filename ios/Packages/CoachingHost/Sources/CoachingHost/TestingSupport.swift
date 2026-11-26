import Foundation

/// Test-only reads (SPI): never part of a shared port. They expose opaque ids and versions, never a value.
extension CoachingHost {
    @_spi(CoachingHostTesting)
    public func heartRateDeclarationIdsForTesting() async -> [String] {
        let a: Answer = await onQueue { self.perform("heartRateDeclarationIds", clockRule: .read) }
        return a.object["ids"] as? [String] ?? []
    }
    @_spi(CoachingHostTesting)
    public func versionForTesting() async -> Int? {
        let a: Answer = await onQueue { self.perform("version", clockRule: .read) }
        return (a.object["version"] as? NSNumber)?.intValue
    }
}

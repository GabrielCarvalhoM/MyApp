import Foundation

/// A string code from the frozen engine, decoded without guessing: a value this app version does not know is kept as `unrecognized`, never
/// mapped to a nearby known value. Every screen treats `unrecognized` as fail-closed (nothing startable, the operational/integrity screen).
public protocol OpenCode: Decodable, Equatable, Sendable {
    init(raw: String)
    var raw: String { get }
}
extension OpenCode {
    public init(from decoder: Decoder) throws { self.init(raw: try decoder.singleValueContainer().decode(String.self)) }
}

/// The client states of `views.mjs CLIENT_STATES`. `REDUCED` is in the engine vocabulary but `V1_SERVER_STATES` excludes it: V1 never returns it,
/// so it decodes as `unrecognized("REDUCED")` and fails closed. `notSynced` is the app's own state (A's queue); the engine never returns it.
public enum ClientState: OpenCode {
    case validPlan, pendingConfirmation, needsInput, returning, blocked, integrityFailure, operationalError, noData, notSynced
    case unrecognized(String)
    public init(raw: String) {
        switch raw {
        case "VALID_PLAN": self = .validPlan
        case "PENDING_CONFIRMATION": self = .pendingConfirmation
        case "NEEDS_INPUT": self = .needsInput
        case "RETURNING": self = .returning
        case "BLOCKED": self = .blocked
        case "INTEGRITY_FAILURE": self = .integrityFailure
        case "OPERATIONAL_ERROR": self = .operationalError
        case "NO_DATA": self = .noData
        case "NOT_SYNCED": self = .notSynced
        default: self = .unrecognized(raw)
        }
    }
    public var raw: String {
        switch self {
        case .validPlan: "VALID_PLAN"
        case .pendingConfirmation: "PENDING_CONFIRMATION"
        case .needsInput: "NEEDS_INPUT"
        case .returning: "RETURNING"
        case .blocked: "BLOCKED"
        case .integrityFailure: "INTEGRITY_FAILURE"
        case .operationalError: "OPERATIONAL_ERROR"
        case .noData: "NO_DATA"
        case .notSynced: "NOT_SYNCED"
        case .unrecognized(let s): s
        }
    }
}

/// Any other engine code (sport state, role, family, effort domain, status, reason, error code): kept verbatim. Screens map the codes they
/// know to localized copy and show nothing invented for the others.
public struct Code: OpenCode, Hashable, ExpressibleByStringLiteral {
    public let raw: String
    public init(raw: String) { self.raw = raw }
    public init(stringLiteral value: String) { self.raw = value }
}

/// English text the engine writes (reasons, statements, instructions). V1 ships PT-BR, EN and ES: the UI renders localized copy from the
/// codes beside it and shows engine text only where a reviewed copy table says so (UI_CONTRACT_GAPS GAP-COPY-01). Never parsed for numbers.
public struct EngineText: Decodable, Equatable, Sendable {
    public let english: String
    public init(from decoder: Decoder) throws { english = try decoder.singleValueContainer().decode(String.self) }
}

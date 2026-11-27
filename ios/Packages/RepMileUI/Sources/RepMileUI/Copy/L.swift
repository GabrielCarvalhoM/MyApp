import CoachingPresentation
import Foundation

/// The copy table (Copy/copy.psv → <lang>.lproj/Localizable.strings). Engine codes map to copy; a code without copy shows nothing.
enum L {
    static func t(_ key: String) -> String { NSLocalizedString(key, bundle: .module, comment: "") }
    static func f(_ key: String, _ args: String...) -> String { String(format: t(key), arguments: args.map { $0 as CVarArg }) }
    /// The copy for `prefix.<code>`, or nil when the table has none (an unknown code is never shown raw).
    static func code(_ prefix: String, _ code: Code?) -> String? {
        guard let raw = code?.raw else { return nil }
        let key = prefix + "." + raw
        let s = t(key)
        return s == key ? nil : s
    }
}

/// Display formatting. Plan dates are plan-local days (`YYYY-MM-DD`), parsed and formatted in UTC so no device time zone shifts them.
enum Fmt {
    static var locale: Locale { Locale(identifier: Bundle.module.preferredLocalizations.first ?? "pt-BR") }
    static let utc = TimeZone(identifier: "UTC")!
    static var calendar: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = utc; c.firstWeekday = 2; return c }

    static func day(_ s: String) -> Date? {
        let f = DateFormatter(); f.calendar = calendar; f.timeZone = utc; f.locale = Locale(identifier: "en_US_POSIX"); f.dateFormat = "yyyy-MM-dd"
        return f.date(from: s)
    }
    /// The device's local calendar day (used only where no plan-local day exists yet, e.g. onboarding). `timeZone` is for tests.
    static func deviceDay(_ d: Date, in timeZone: TimeZone = .current) -> String {
        let f = DateFormatter(); f.calendar = Calendar(identifier: .gregorian); f.timeZone = timeZone; f.locale = Locale(identifier: "en_US_POSIX"); f.dateFormat = "yyyy-MM-dd"
        return f.string(from: d)
    }
    static func dayString(_ d: Date) -> String {
        let f = DateFormatter(); f.calendar = calendar; f.timeZone = utc; f.locale = Locale(identifier: "en_US_POSIX"); f.dateFormat = "yyyy-MM-dd"
        return f.string(from: d)
    }
    private static func formatted(_ d: Date, _ template: String) -> String {
        let f = DateFormatter(); f.calendar = calendar; f.timeZone = utc; f.locale = locale
        f.setLocalizedDateFormatFromTemplate(template)
        return f.string(from: d).replacingOccurrences(of: ".", with: "")
    }
    /// "Domingo · 22 nov"
    static func longDay(_ s: String) -> String {
        guard let d = day(s) else { return "" }
        let wd = formatted(d, "EEEE").capitalized(with: locale)
        return wd + " · " + formatted(d, "d MMM")
    }
    /// "Qui", "Thu".
    static func weekdayShort(_ s: String) -> String { day(s).map { formatted($0, "EEE").capitalized(with: locale) } ?? "" }
    /// "na sexta" style phrase is avoided (it is language specific): the weekday name alone.
    static func weekdayName(_ s: String) -> String { day(s).map { formatted($0, "EEEE") } ?? "" }
    /// "na sexta", "no sábado", "on Friday", "el viernes".
    static func onWeekday(_ s: String) -> String {
        guard let d = day(s) else { return "" }
        let name = formatted(d, "EEEE")
        switch locale.language.languageCode?.identifier {
        case "pt":
            let short = name.replacingOccurrences(of: "-feira", with: "")
            return (["sábado", "domingo"].contains(short) ? "no " : "na ") + short
        case "es": return "el " + name
        default: return "on " + name.capitalized(with: locale)
        }
    }
    static func dayNumber(_ s: String) -> String { day(s).map { formatted($0, "d") } ?? "" }
    static func shortDate(_ s: String) -> String { day(s).map { formatted($0, "d MMM") } ?? "" }
    static func weekdayAndDate(_ s: String) -> String { day(s).map { formatted($0, "EEE, d MMM") } ?? "" }
    /// An engine instant (ISO 8601, e.g. `hold.since`) as the device shows it: "ter, 17 nov · 08:00". Nil when it does not parse (then the
    /// screen shows no time rather than a made-up one). `timeZone` is for tests.
    static func instant(_ iso: String, in timeZone: TimeZone = .current) -> String? {
        let parser = ISO8601DateFormatter(); parser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let d = parser.date(from: iso) ?? ISO8601DateFormatter().date(from: iso) else { return nil }
        var cal = Calendar(identifier: .gregorian); cal.timeZone = timeZone
        func f(_ template: String) -> String {
            let f = DateFormatter(); f.calendar = cal; f.timeZone = timeZone; f.locale = locale
            f.setLocalizedDateFormatFromTemplate(template)
            return f.string(from: d).replacingOccurrences(of: ".", with: "")
        }
        return f("EEE, d MMM") + " · " + f("jmm")
    }

    static func number(_ v: Double, fraction: Int = 0) -> String {
        v.formatted(.number.precision(.fractionLength(0...fraction)).locale(locale))
    }
    static func minutes(_ v: Double) -> String { number(v.rounded()) }
    /// 2925 → "48:45"; 3725 → "1:02:05".
    static func clock(_ seconds: Double) -> String {
        let t = Int(seconds.rounded()); let h = t / 3600, m = (t % 3600) / 60, s = t % 60
        return h > 0 ? String(format: "%d:%02d:%02d", h, m, s) : String(format: "%d:%02d", m, s)
    }
    static var usesMiles: Bool { locale.measurementSystem == .us }
    /// A pace band (s/km) in the locale's unit: "6:15–7:10 /km".
    static func paceBand(fast: Double, slow: Double) -> String {
        let k = usesMiles ? 1.609344 : 1
        return clock(fast * k) + "–" + clock(slow * k) + (usesMiles ? " /mi" : " /km")
    }
    static func distance(km: Double) -> String {
        usesMiles ? number(km / 1.609344, fraction: 1) + " mi" : number(km, fraction: 1) + " km"
    }
    static func rpe(_ r: [Double]?) -> String? {
        guard let r, let lo = r.first, let hi = r.last else { return nil }
        return lo == hi ? number(lo) : number(lo) + "–" + number(hi)
    }
}

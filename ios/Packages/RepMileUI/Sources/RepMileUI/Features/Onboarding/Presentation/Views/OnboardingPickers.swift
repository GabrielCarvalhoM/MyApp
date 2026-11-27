import SwiftUI

/// One column of "Seletor em roda" (04, 05, 18, 23): the values scroll under the "Faixa do escolhido". Its first row is "—" (no value): the
/// column is unanswered until the athlete moves it (D17). VoiceOver adjusts it one row at a time.
struct OBWheelColumn: View {
    let values: [Int]
    @Binding var selection: Int?
    let label: (Int) -> String
    var unit: String?
    let id: String
    @State private var position: Int?
    private let rowHeight: CGFloat = 36
    private func row(of s: Int?) -> Int { s.flatMap { v in values.firstIndex(of: v).map { $0 + 1 } } ?? 0 }

    var body: some View {
        HStack(spacing: 6) {
            ScrollView(.vertical) {
                LazyVStack(spacing: 0) {
                    ForEach(0...values.count, id: \.self) { i in
                        Text(i == 0 ? "—" : label(values[i - 1])).rmText(.numeroM).monospacedDigit().lineLimit(1).minimumScaleFactor(0.7)
                            .frame(maxWidth: .infinity, minHeight: rowHeight)
                            .scrollTransition(.interactive) { c, p in c.opacity(p.isIdentity ? 1 : 0.35).scaleEffect(p.isIdentity ? 1 : 0.86) }
                            .id(i)
                    }
                }
                .scrollTargetLayout()
            }
            .scrollTargetBehavior(.viewAligned)
            .scrollPosition(id: $position, anchor: .center)
            .contentMargins(.vertical, rowHeight * 2, for: .scrollContent)
            .scrollIndicators(.hidden)
            .frame(height: rowHeight * 5)
            if let unit { Text(unit).rmText(.detalhe, RM.Palette.textoTerciario) }
        }
        .onAppear { position = row(of: selection) }
        .onChange(of: position) { _, p in
            guard let p else { return }
            selection = p == 0 ? nil : values[min(values.count, p) - 1]
        }
        // A value set from outside (a resumed draft, the other columns of a date) moves the wheel to it.
        .onChange(of: selection) { _, s in if position != row(of: s) { position = row(of: s) } }
        .accessibilityElement(children: .ignore)
        .accessibilityValue(selection.map(label) ?? "—")
        .accessibilityAdjustableAction { d in
            let cur = position ?? 0
            withAnimation { position = d == .increment ? min(values.count, cur + 1) : max(0, cur - 1) }
        }
        .accessibilityIdentifier(id)
    }
}

/// The wheel card: the columns over the highlighted band (radius 24, fundo/elevado; band fundo/elevado-2).
struct OBWheelCard<Columns: View>: View {
    @ViewBuilder let columns: Columns
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12, style: .continuous).fill(RM.Palette.fundoElevado2).frame(height: 44).padding(.horizontal, 12)
            HStack(spacing: 8) { columns }.padding(.horizontal, 16)
        }
        .padding(.vertical, 8)
        .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .padding(.horizontal, RM.Space.gutter)
    }
}

/// 19 "Altura e peso" (`836:2649`): the value over a ruler that scrolls under the centre mark. "—" until moved.
struct OBRuler: View {
    let title: String
    let values: [Int]
    @Binding var selection: Int?
    let label: (Int) -> String
    let unit: String
    let id: String
    @State private var position: Int?

    var body: some View {
        VStack(spacing: 6) {
            Text(title).rmText(.micro, RM.Palette.textoTerciario)
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(selection.map(label) ?? "—").rmText(.numeroXL).monospacedDigit()
                Text(unit).rmText(.corpo, RM.Palette.textoSecundario)
            }
            ZStack {
                ScrollView(.horizontal) {
                    LazyHStack(spacing: 0) {
                        ForEach(0...values.count, id: \.self) { i in
                            Rectangle().fill(RM.Palette.textoTerciario.opacity(i == 0 ? 0 : 0.6))
                                .frame(width: 1.5, height: i % 5 == 0 ? 22 : 12).frame(width: 10, height: 28, alignment: .center).id(i)
                        }
                    }
                    .scrollTargetLayout()
                }
                .scrollTargetBehavior(.viewAligned)
                .scrollPosition(id: $position, anchor: .center)
                .contentMargins(.horizontal, 160, for: .scrollContent)
                .scrollIndicators(.hidden)
                Capsule().fill(RM.Palette.agora).frame(width: 3, height: 30).allowsHitTesting(false)
            }
            .frame(height: 32)
        }
        .padding(.vertical, 16).padding(.horizontal, 8)
        .frame(maxWidth: .infinity)
        .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .padding(.horizontal, RM.Space.gutter)
        .onAppear { position = selection.flatMap { s in values.firstIndex(of: s).map { $0 + 1 } } ?? 0 }
        .onChange(of: position) { _, p in guard let p else { return }; selection = p == 0 ? nil : values[min(values.count, p) - 1] }
        .onChange(of: selection) { _, s in
            let r = s.flatMap { v in values.firstIndex(of: v).map { $0 + 1 } } ?? 0
            if position != r { position = r }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title).accessibilityValue(selection.map { label($0) + " " + unit } ?? "—")
        .accessibilityAdjustableAction { d in
            let cur = position ?? 0
            withAnimation { position = d == .increment ? min(values.count, cur + 1) : max(0, cur - 1) }
        }
        .accessibilityIdentifier(id)
    }
}

/// 27 "Cuidados" row: the sign and its square box.
struct OBCheckRow: View {
    let title: String
    let checked: Bool
    let id: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Text(title).rmText(.corpo).fixedSize(horizontal: false, vertical: true).frame(maxWidth: .infinity, alignment: .leading)
                ZStack {
                    RoundedRectangle(cornerRadius: 6, style: .continuous).strokeBorder(checked ? RM.Palette.agora : RM.Palette.textoTerciario, lineWidth: 1.5)
                        .background(checked ? RM.Palette.agora : .clear, in: RoundedRectangle(cornerRadius: 6, style: .continuous))
                    if checked { RMIconView(.check, size: 14).foregroundStyle(RM.Palette.agoraSobre) }
                }
                .frame(width: 24, height: 24)
            }
            .padding(.vertical, 14).contentShape(Rectangle())
        }
        .buttonStyle(.plain).accessibilityAddTraits(checked ? .isSelected : []).accessibilityIdentifier(id)
    }
}

/// 29 "Como seus dados são usados" row: title, line and either "Necessário" or the athlete's toggle (off until turned on).
struct OBConsentRow: View {
    let title: String
    let detail: String
    var isOn: Binding<Bool>?
    let id: String
    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                Text(title).rmText(.subtitulo)
                Text(detail).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            if let isOn {
                Toggle("", isOn: isOn).labelsHidden().tint(RM.Palette.agora).accessibilityLabel(title).accessibilityIdentifier(id)
            } else {
                Text(L.t("ob.data.necessary")).rmText(.detalhe, RM.Palette.textoSecundario)
                    .padding(.horizontal, 10).padding(.vertical, 5).background(RM.Palette.fundoElevado2, in: Capsule())
            }
        }
        .padding(.vertical, 14)
    }
}

/// A summary row (28, the resume screen): title, line and a value on the right.
struct OBSummaryRow: View {
    let title: String
    var detail: String?
    var value: String?
    var valueStyle: RMTextStyle = .numeroS
    var dimmed = false
    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                Text(title).rmText(.subtitulo, dimmed ? RM.Palette.textoTerciario : RM.Palette.textoPrimario)
                if let detail { Text(detail).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            if let value { Text(value).rmText(valueStyle, dimmed ? RM.Palette.textoTerciario : RM.Palette.textoPrimario) }
        }
        .padding(.vertical, 14)
        .accessibilityElement(children: .combine)
    }
}

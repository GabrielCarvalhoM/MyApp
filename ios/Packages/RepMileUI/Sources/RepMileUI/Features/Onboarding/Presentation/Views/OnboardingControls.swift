import SwiftUI

/// "Opção · …" (02 `835:2145`): icon, title and line in a card; the chosen card has the white outline and the check.
struct OBOptionCard: View {
    var icons: [RMIcon] = []
    let title: String
    var detail: String?
    let selected: Bool
    let id: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                if !icons.isEmpty {
                    HStack(spacing: -2) { ForEach(icons, id: \.self) { i in RMIconView(i, size: icons.count > 1 ? 12 : 16).foregroundStyle(i == .forca ? RM.Palette.forca : i == .corrida ? RM.Palette.corrida : RM.Palette.textoPrimario) } }
                        .frame(width: 36, height: 36).background(RM.Palette.fundoElevado2, in: Circle())
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text(title).rmText(.subtitulo)
                    if let detail { Text(detail).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                OBRadio(selected: selected)
            }
            .padding(.horizontal, 14).padding(.vertical, 14)
            .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).strokeBorder(selected ? RM.Palette.agora : .clear, lineWidth: 1.5))
            .contentShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain).accessibilityAddTraits(selected ? .isSelected : []).accessibilityIdentifier(id)
    }
}

/// "Escolhido / Não escolhido": the white disc with a check, or the empty ring.
struct OBRadio: View {
    let selected: Bool
    var body: some View {
        ZStack {
            if selected {
                Circle().fill(RM.Palette.agora)
                RMIconView(.check, size: 12).foregroundStyle(RM.Palette.agoraSobre)
            } else {
                Circle().strokeBorder(RM.Palette.textoTerciario, lineWidth: 1.5)
            }
        }
        .frame(width: 24, height: 24).accessibilityHidden(true)
    }
}

/// "Pílulas" (03, 06, 12, 13…): wrapping pills; the chosen one is white. `checks` adds the check of the multi-choice pills (13, `867:2289`).
struct OBPills: View {
    let items: [(id: String, label: String)]
    let selected: Set<String>
    var checks = false
    let pick: (String) -> Void
    var body: some View {
        OBWrap(spacing: 10) {
            ForEach(items, id: \.id) { item in
                let on = selected.contains(item.id)
                Button { pick(item.id) } label: {
                    HStack(spacing: 6) {
                        if checks && on { RMIconView(.check, size: 14) }
                        Text(item.label).rmText(.subtitulo, on ? RM.Palette.agoraSobre : RM.Palette.textoPrimario).lineLimit(2)
                    }
                    .foregroundStyle(on ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                    .padding(.horizontal, 20).padding(.vertical, 13)
                    .background(on ? RM.Palette.agora : RM.Palette.fundoElevado, in: Capsule())
                }
                .buttonStyle(.plain).accessibilityAddTraits(on ? .isSelected : []).accessibilityIdentifier("ob-pill-\(item.id)")
            }
        }
    }
}

/// A flow layout: children left to right, wrapping (iOS 17 `Layout`).
struct OBWrap: Layout {
    var spacing: CGFloat = 10
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = arrange(width: proposal.width ?? .infinity, subviews)
        return CGSize(width: proposal.width ?? rows.map(\.width).max() ?? 0, height: rows.last.map { $0.y + $0.height } ?? 0)
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        for row in arrange(width: bounds.width, subviews) {
            var x = bounds.minX
            for i in row.items {
                let s = subviews[i].sizeThatFits(ProposedViewSize(width: bounds.width, height: nil))
                subviews[i].place(at: CGPoint(x: x, y: bounds.minY + row.y), proposal: ProposedViewSize(width: min(s.width, bounds.width), height: s.height))
                x += s.width + spacing
            }
        }
    }
    private struct Row { var items: [Int] = []; var y: CGFloat = 0; var width: CGFloat = 0; var height: CGFloat = 0 }
    private func arrange(width: CGFloat, _ subviews: Subviews) -> [Row] {
        var rows: [Row] = [Row()]
        for i in subviews.indices {
            let s = subviews[i].sizeThatFits(ProposedViewSize(width: width, height: nil))
            if !rows[rows.count - 1].items.isEmpty && rows[rows.count - 1].width + spacing + s.width > width {
                let last = rows[rows.count - 1]
                rows.append(Row(y: last.y + last.height + spacing))
            }
            var r = rows[rows.count - 1]
            r.width += (r.items.isEmpty ? 0 : spacing) + min(s.width, width); r.height = max(r.height, s.height); r.items.append(i)
            rows[rows.count - 1] = r
        }
        return rows
    }
}

/// A counter row (11 `836:546`, 21 `836:2872`, 25): title and line, −, the value and its unit, +. "—" until touched (D17): the first "+"
/// starts at the lowest value of the range, so nothing is pre-answered.
struct OBCounterRow: View {
    let title: String
    var detail: String?
    @Binding var value: Int?
    let range: ClosedRange<Int>
    var step = 1
    let unit: String
    let id: String
    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).rmText(.subtitulo)
                if let detail { Text(detail).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            round("−", enabled: value.map { $0 > range.lowerBound } ?? false) { value = max(range.lowerBound, (value ?? range.lowerBound) - step) }
            VStack(spacing: 0) {
                Text(value.map(String.init) ?? "—").rmText(.numeroM).monospacedDigit().lineLimit(1).minimumScaleFactor(0.6)
                Text(unit).rmText(.detalhe, RM.Palette.textoTerciario)
            }
            .frame(minWidth: 64)
            round("+", enabled: value.map { $0 < range.upperBound } ?? true) { value = value.map { min(range.upperBound, $0 + step) } ?? range.lowerBound }
        }
        .padding(.vertical, 12)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title).accessibilityValue(value.map { "\($0) \(unit)" } ?? "—")
        .accessibilityAdjustableAction { dir in
            switch dir {
            case .increment: value = value.map { min(range.upperBound, $0 + step) } ?? range.lowerBound
            case .decrement: if let v = value { value = max(range.lowerBound, v - step) }
            @unknown default: break
            }
        }
        .accessibilityIdentifier(id)
    }
    private func round(_ sign: String, enabled: Bool, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(sign).font(.system(size: 22, weight: .regular)).foregroundStyle(enabled ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                .frame(width: 36, height: 36).background(RM.Palette.fundoElevado2, in: Circle())
        }
        .buttonStyle(.plain).disabled(!enabled)
    }
}

/// The card that groups counter rows or list rows (radius 20, fundo/elevado, divisors between rows).
struct OBGroup<Content: View>: View {
    @ViewBuilder let content: Content
    var body: some View {
        VStack(spacing: 0) { content }
            .padding(.horizontal, 16)
            .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .padding(.horizontal, RM.Space.gutter)
    }
}

/// 24 segmented choices ("Prova oficial · Pista · Teste", "Sim · Não", "Normais · Calor ou subida").
struct OBSegmented: View {
    let items: [(id: String, label: String)]
    let selected: String?
    let pick: (String) -> Void
    var body: some View {
        HStack(spacing: 4) {
            ForEach(items, id: \.id) { item in
                let on = selected == item.id
                Button { pick(item.id) } label: {
                    Text(item.label).rmText(.rotulo, on ? RM.Palette.agoraSobre : RM.Palette.textoSecundario)
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background(on ? RM.Palette.agora : .clear, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                }
                .buttonStyle(.plain).accessibilityAddTraits(on ? .isSelected : []).accessibilityIdentifier("ob-seg-\(item.id)")
            }
        }
        .padding(3).background(RM.Palette.fundoElevado2, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

/// 24 "Esforço": ten dots and "N de 10". None filled until touched.
struct OBEffortDots: View {
    @Binding var value: Int?
    var body: some View {
        HStack(spacing: 2) {
            ForEach(1...10, id: \.self) { i in
                Button { value = i } label: {
                    Circle().fill((value ?? 0) >= i ? RM.Palette.corrida : RM.Palette.fundoTrilho)
                        .frame(width: i == value ? 12 : 8, height: i == value ? 12 : 8).frame(width: 20, height: 32)
                }
                .buttonStyle(.plain)
            }
            Spacer(minLength: 4)
            Text(value.map { L.f("ob.resultDetail.effortValue", "\($0)") } ?? "—").rmText(.numeroS).lineLimit(1).fixedSize()
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(L.t("ob.resultDetail.effort")).accessibilityValue(value.map { L.f("ob.resultDetail.effortValue", "\($0)") } ?? "—")
        .accessibilityAdjustableAction { d in
            if d == .increment { value = min(10, (value ?? 0) + 1) } else if let v = value, v > 1 { value = v - 1 }
        }
        .accessibilityIdentifier("ob-effort")
    }
}

import SwiftUI

/// Wrapping selection chips.
struct FlowChips: View {
    let items: [(String, String)]
    let selected: Set<String>
    let pick: (String) -> Void
    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: 8)], alignment: .leading, spacing: 8) {
            ForEach(items, id: \.0) { code, label in
                Button { pick(code) } label: {
                    Text(label).rmText(.rotulo, selected.contains(code) ? RM.Palette.agoraSobre : RM.Palette.textoPrimario).lineLimit(1).minimumScaleFactor(0.8)
                        .frame(maxWidth: .infinity, minHeight: 40).padding(.horizontal, 8)
                        .background(selected.contains(code) ? RM.Palette.agora : RM.Palette.fundoElevado, in: Capsule())
                }
                .buttonStyle(.plain).accessibilityAddTraits(selected.contains(code) ? .isSelected : []).accessibilityIdentifier("chip-\(code)")
            }
        }
    }
}

/// "Montando o plano" (motion priority 2): the double lane drawing itself; a static mark with Reduce Motion.
struct PlanBuildingMark: View {
    let animate: Bool
    @State private var progress: CGFloat = 0
    var body: some View {
        ZStack {
            Capsule().stroke(RM.Palette.fundoTrilho, lineWidth: 14)
            Capsule().trim(from: 0, to: progress).stroke(RM.Palette.corrida, style: StrokeStyle(lineWidth: 5, lineCap: .round))
            Capsule().inset(by: 18).trim(from: 0, to: progress).stroke(RM.Palette.forca, style: StrokeStyle(lineWidth: 12, dash: [22, 4]))
        }
        .frame(width: 220, height: 140)
        .onAppear {
            if animate { withAnimation(.easeInOut(duration: 1.4).repeatForever(autoreverses: false)) { progress = 1 } } else { progress = 1 }
        }
        .accessibilityHidden(true)
    }
}

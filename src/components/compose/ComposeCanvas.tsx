import type { FigureState, ComposeLayout } from '../../types/figures'

interface Props {
  figures: FigureState[]
  layout: ComposeLayout
  previews: Record<string, string>
}

const TYPE_LABEL: Record<string, string> = {
  confusion_matrix: '混合行列',
  heatmap: 'ヒートマップ',
}

export default function ComposeCanvas({ figures, layout, previews }: Props) {
  const { gridCols, gap } = layout
  const gapPx = Math.round(gap * 28)   // ≈ screen px per cm

  if (figures.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-64"
        style={{ border: '1px dashed #D1D5DB', borderRadius: 14, color: '#9CA3AF', fontSize: 13 }}
      >
        図がありません
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: `${gapPx}px`,
        background: 'white',
        padding: `${gapPx}px`,
        border: '1px solid #E5E7EB',
        borderRadius: 14,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {figures.map((fig, i) => {
        const b64 = previews[fig.id]
        return (
          <div key={fig.id} className="flex flex-col">
            {b64 ? (
              <img
                src={`data:image/png;base64,${b64}`}
                alt={fig.params.title || `Figure ${i + 1}`}
                className="w-full object-contain"
              />
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-2"
                style={{
                  aspectRatio: '4/3',
                  background: '#F9FAFB',
                  border: '1px dashed #D1D5DB',
                  borderRadius: 8,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-200 animate-spin"
                  style={{ borderTopColor: '#6C63FF' }}
                />
                <span className="text-xs text-gray-400">
                  {TYPE_LABEL[fig.type] ?? fig.type} {i + 1}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

import type { BaseFigureParams } from '../../types/figures'

interface Props {
  params: BaseFigureParams
  onChange: (patch: Partial<BaseFigureParams>) => void
}

const DPI_OPTIONS = [72, 150, 300]

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.15s',
}

export default function SizeEditor({ params, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">幅 (cm)</label>
          <input
            type="number"
            min={3} max={30} step={0.5}
            value={params.figsize_cm[0]}
            onChange={(e) =>
              onChange({ figsize_cm: [Number(e.target.value), params.figsize_cm[1]] })
            }
            className="w-full text-sm px-2 py-1.5"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E7EB' }}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">高さ (cm)</label>
          <input
            type="number"
            min={3} max={30} step={0.5}
            value={params.figsize_cm[1]}
            onChange={(e) =>
              onChange({ figsize_cm: [params.figsize_cm[0], Number(e.target.value)] })
            }
            className="w-full text-sm px-2 py-1.5"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E7EB' }}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          DPI <span className="text-gray-400 font-normal">（解像度: Web=150, 論文=300）</span>
        </label>
        <div className="flex gap-2">
          {DPI_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ dpi: d })}
              className="flex-1 py-1 text-sm font-medium transition-all"
              style={{
                border: params.dpi === d ? '1px solid #6C63FF' : '1px solid #E5E7EB',
                borderRadius: 8,
                background: params.dpi === d ? '#EEF2FF' : 'white',
                color: params.dpi === d ? '#6C63FF' : '#6B7280',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

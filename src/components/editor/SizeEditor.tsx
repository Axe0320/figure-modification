import type { BaseFigureParams } from '../../types/figures'

interface Props {
  params: BaseFigureParams
  onChange: (patch: Partial<BaseFigureParams>) => void
}

const DPI_OPTIONS = [72, 150, 300]

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
            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5
              focus:outline-none focus:border-blue-400"
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
            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5
              focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">DPI</label>
        <div className="flex gap-2">
          {DPI_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ dpi: d })}
              className={`flex-1 py-1 text-sm rounded border transition-colors ${
                params.dpi === d
                  ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

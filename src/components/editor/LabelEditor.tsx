import type { ConfusionMatrixParams } from '../../types/figures'

interface Props {
  params: ConfusionMatrixParams
  matrixSize: number
  onChange: (patch: Partial<ConfusionMatrixParams>) => void
}

export default function LabelEditor({ params, matrixSize, onChange }: Props) {
  const labels = params.labels.length === matrixSize
    ? params.labels
    : Array.from({ length: matrixSize }, (_, i) => params.labels[i] ?? `Class ${i}`)

  const setLabel = (i: number, val: string) => {
    const next = [...labels]
    next[i] = val
    onChange({ labels: next })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-500 mb-2">クラスラベル</label>
        <div className="space-y-1.5">
          {labels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{i}</span>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(i, e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1
                  focus:outline-none focus:border-blue-400"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.normalize}
            onChange={(e) => onChange({ normalize: e.target.checked })}
            className="accent-blue-500"
          />
          <span className="text-sm text-gray-700">正規化</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.show_values}
            onChange={(e) => onChange({ show_values: e.target.checked })}
            className="accent-blue-500"
          />
          <span className="text-sm text-gray-700">値を表示</span>
        </label>
      </div>
    </div>
  )
}

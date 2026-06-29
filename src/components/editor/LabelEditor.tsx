import type { ConfusionMatrixParams } from '../../types/figures'

interface Props {
  params: ConfusionMatrixParams
  matrixSize: number
  onChange: (patch: Partial<ConfusionMatrixParams>) => void
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.15s',
}

export default function LabelEditor({ params, matrixSize, onChange }: Props) {
  const labels = Array.from({ length: matrixSize }, (_, i) =>
    params.labels[i] ?? `Class ${i}`
  )

  const setLabel = (i: number, val: string) => {
    const next = [...labels]
    next[i] = val
    onChange({ labels: next })
  }

  return (
    <div className="space-y-4">
      {/* 軸ラベル */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">軸ラベル</p>
        <div>
          <label className="block text-xs text-gray-400 mb-1">x軸（列方向）</label>
          <input
            type="text"
            value={params.xlabel}
            onChange={(e) => onChange({ xlabel: e.target.value })}
            className="w-full text-sm px-2 py-1.5"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E7EB' }}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">y軸（行方向）</label>
          <input
            type="text"
            value={params.ylabel}
            onChange={(e) => onChange({ ylabel: e.target.value })}
            className="w-full text-sm px-2 py-1.5"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E7EB' }}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.xlabel_top}
            onChange={(e) => onChange({ xlabel_top: e.target.checked })}
            className="accent-[#6C63FF]"
          />
          <span className="text-sm text-gray-700">x軸を上部に表示</span>
        </label>
      </div>

      {/* クラスラベル */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">クラスラベル</p>
        <p className="text-xs text-gray-400 mb-2">改行は \n で入力（例: Organic\naccount）</p>
        <div className="space-y-1.5">
          {labels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{i}</span>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(i, e.target.value)}
                className="flex-1 text-sm px-2 py-1"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E7EB' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 罫線 */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">罫線</p>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            太さ: {params.linewidths}px
          </label>
          <input
            type="range"
            min={0} max={3} step={0.5}
            value={params.linewidths}
            onChange={(e) => onChange({ linewidths: Number(e.target.value) })}
            className="w-full accent-[#6C63FF]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>なし</span><span>太</span>
          </div>
        </div>
        <div className="mt-2">
          <label className="block text-xs text-gray-400 mb-1">罫線の色</label>
          <div className="flex gap-2">
            {['white', 'black', 'gray', 'lightgray'].map((c) => (
              <button
                key={c}
                onClick={() => onChange({ linecolor: c })}
                title={c}
                className="w-7 h-7 rounded transition-all"
                style={{
                  background: c,
                  border: params.linecolor === c ? '2px solid #6C63FF' : '2px solid #D1D5DB',
                  transform: params.linecolor === c ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* チェックボックス */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.normalize}
            onChange={(e) => onChange({ normalize: e.target.checked })}
            className="accent-[#6C63FF]"
          />
          <span className="text-sm text-gray-700">正規化</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.show_values}
            onChange={(e) => onChange({ show_values: e.target.checked })}
            className="accent-[#6C63FF]"
          />
          <span className="text-sm text-gray-700">値を表示</span>
        </label>
      </div>
    </div>
  )
}

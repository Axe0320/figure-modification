import type { BaseFigureParams } from '../../types/figures'

type ExtendedParams = BaseFigureParams & {
  annot_fontsize?: number
  tick_fontsize?: number
}

interface Props {
  params: ExtendedParams
  onChange: (patch: Partial<ExtendedParams>) => void
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.15s',
}

export default function TextEditor({ params, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">タイトル</label>
        <input
          type="text"
          value={params.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="タイトルなし"
          className="w-full text-sm px-3 py-1.5"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E7EB' }}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          タイトル・軸ラベルサイズ: {params.fontsize}pt
        </label>
        <input
          type="range"
          min={8} max={24} step={1}
          value={params.fontsize}
          onChange={(e) => onChange({ fontsize: Number(e.target.value) })}
          className="w-full accent-[#6C63FF]"
        />
      </div>
      {params.annot_fontsize !== undefined && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            セル内数値サイズ: {params.annot_fontsize}pt
          </label>
          <input
            type="range"
            min={6} max={24} step={1}
            value={params.annot_fontsize}
            onChange={(e) => onChange({ annot_fontsize: Number(e.target.value) })}
            className="w-full accent-[#6C63FF]"
          />
        </div>
      )}
      {params.tick_fontsize !== undefined && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            クラスラベルサイズ: {params.tick_fontsize}pt
          </label>
          <input
            type="range"
            min={6} max={24} step={1}
            value={params.tick_fontsize}
            onChange={(e) => onChange({ tick_fontsize: Number(e.target.value) })}
            className="w-full accent-[#6C63FF]"
          />
        </div>
      )}
    </div>
  )
}

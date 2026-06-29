import type { BaseFigureParams } from '../../types/figures'

interface Props {
  params: BaseFigureParams
  onChange: (patch: Partial<BaseFigureParams>) => void
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
          フォントサイズ: {params.fontsize}pt
        </label>
        <input
          type="range"
          min={8} max={24} step={1}
          value={params.fontsize}
          onChange={(e) => onChange({ fontsize: Number(e.target.value) })}
          className="w-full accent-[#6C63FF]"
        />
      </div>
    </div>
  )
}

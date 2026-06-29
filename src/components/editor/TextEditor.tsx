import type { BaseFigureParams } from '../../types/figures'

interface Props {
  params: BaseFigureParams
  onChange: (patch: Partial<BaseFigureParams>) => void
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
          className="w-full text-sm border border-gray-300 rounded px-3 py-1.5
            focus:outline-none focus:border-blue-400"
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
          className="w-full accent-blue-500"
        />
      </div>
    </div>
  )
}

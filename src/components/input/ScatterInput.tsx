import { useRef } from 'react'
import type { ScatterData } from '../../types/figures'
import { parseCsv, toNum } from './DataInput/parseCsv'

interface Props {
  data: ScatterData
  onChange: (data: ScatterData) => void
}

const SAMPLE: ScatterData = {
  x: [1, 2, 3, 4, 5, 6, 7, 8],
  y: [1.2, 2.5, 2.8, 4.1, 4.9, 6.2, 6.8, 8.3],
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.15s',
  fontSize: 12,
}

export default function ScatterInput({ data, onChange }: Props) {
  const pasteRef = useRef<HTMLTextAreaElement>(null)

  const handlePaste = () => {
    const text = pasteRef.current?.value ?? ''
    const rows = parseCsv(text)
    if (rows.length === 0) return

    // ヘッダー行スキップ
    const startRow = isNaN(toNum(rows[0]?.[0] ?? '')) ? 1 : 0
    const dataRows = rows.slice(startRow)
    const x = dataRows.map((r) => toNum(r[0] ?? '0'))
    const y = dataRows.map((r) => toNum(r[1] ?? '0'))
    onChange({ x, y })
    if (pasteRef.current) pasteRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <div
        className="text-xs text-gray-500 px-3 py-2 rounded-lg"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
      >
        {data.x.length} 点
      </div>

      <div>
        <p className="text-[10px] text-gray-400 mb-1">
          CSV / TSV（1列目: x、2列目: y）
        </p>
        <textarea
          ref={pasteRef}
          rows={5}
          className="w-full p-2 text-xs font-mono resize-y"
          style={{ ...inputStyle, borderRadius: 8 }}
          placeholder={'1\t1.2\n2\t2.5\n3\t2.8'}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E7EB' }}
        />
        <button
          onClick={handlePaste}
          className="mt-1 w-full py-1.5 text-xs font-semibold text-white rounded-lg transition-all"
          style={{ background: '#6C63FF' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#5a52e0' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#6C63FF' }}
        >
          データを適用
        </button>
      </div>

      <button
        onClick={() => onChange(SAMPLE)}
        className="w-full py-1.5 text-xs rounded-lg transition-all"
        style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: 'white' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C4B5FD' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB' }}
      >
        サンプルデータを読み込む
      </button>
    </div>
  )
}

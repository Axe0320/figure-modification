import { useRef } from 'react'
import type { LinePlotData } from '../../types/figures'
import { parseCsv, toNum } from './DataInput/parseCsv'

interface Props {
  data: LinePlotData
  onChange: (data: LinePlotData, seriesLabels?: string[]) => void
}

const SAMPLE: LinePlotData = {
  x: [0, 1, 2, 3, 4, 5],
  y: [0.1, 0.4, 0.9, 1.6, 2.5, 3.6],
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.15s',
  fontSize: 12,
}

export default function LinePlotInput({ data, onChange }: Props) {
  const pasteRef = useRef<HTMLTextAreaElement>(null)

  const handlePaste = () => {
    const text = pasteRef.current?.value ?? ''
    const rows = parseCsv(text)
    if (rows.length === 0) return

    // ヘッダー行検出
    let startRow = 0
    const seriesNames: string[] = []
    if (rows.length > 1 && isNaN(toNum(rows[0][0] ?? ''))) {
      seriesNames.push(...rows[0].slice(1))
      startRow = 1
    }

    const dataRows = rows.slice(startRow)
    const x       = dataRows.map((r) => toNum(r[0] ?? '0'))
    const nSeries  = (dataRows[0]?.length ?? 1) - 1

    if (nSeries <= 1) {
      const y = dataRows.map((r) => toNum(r[1] ?? '0'))
      onChange({ x, y }, seriesNames.length ? seriesNames : undefined)
    } else {
      const y = Array.from({ length: nSeries }, (_, si) =>
        dataRows.map((r) => toNum(r[si + 1] ?? '0'))
      )
      onChange({ x, y }, seriesNames.length ? seriesNames : undefined)
    }

    if (pasteRef.current) pasteRef.current.value = ''
  }

  const isMulti  = Array.isArray(data.y[0])
  const nSeries  = isMulti ? (data.y as number[][]).length : 1

  return (
    <div className="space-y-3">
      <div
        className="text-xs text-gray-500 px-3 py-2 rounded-lg"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
      >
        {data.x.length} 点 × {nSeries} 系列
      </div>

      <div>
        <p className="text-[10px] text-gray-400 mb-1">
          CSV / TSV（1列目: x値、残り: y系列値）
        </p>
        <textarea
          ref={pasteRef}
          rows={5}
          className="w-full p-2 text-xs font-mono resize-y"
          style={{ ...inputStyle, borderRadius: 8 }}
          placeholder={'0\t0.1\n1\t0.4\n2\t0.9'}
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

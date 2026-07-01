import { useRef } from 'react'
import type { PieData } from '../../types/figures'
import { parseCsv, toNum } from './DataInput/parseCsv'
import CsvUploadButton from '../common/CsvUploadButton'

interface Props {
  data: PieData
  onChange: (data: PieData) => void
}

const SAMPLE: PieData = {
  labels: ['カテゴリA', 'カテゴリB', 'カテゴリC', 'カテゴリD'],
  values: [35, 28, 22, 15],
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none',
  transition: 'border-color 0.15s', fontSize: 12,
}

function parseRows(rows: string[][]): PieData {
  let startRow = 0
  if (rows.length > 1 && isNaN(toNum(rows[0][1] ?? ''))) startRow = 1
  const dr     = rows.slice(startRow)
  const labels = dr.map((r) => r[0])
  const values = dr.map((r) => toNum(r[1] ?? '0'))
  return { labels, values }
}

export default function PieChartInput({ data, onChange }: Props) {
  const pasteRef = useRef<HTMLTextAreaElement>(null)

  const handlePaste = () => {
    const rows = parseCsv(pasteRef.current?.value ?? '')
    if (rows.length === 0) return
    onChange(parseRows(rows))
    if (pasteRef.current) pasteRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 px-3 py-2 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {data.labels.length} スライス｜合計: {data.values.reduce((a, b) => a + b, 0).toFixed(1)}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-gray-400">CSV / TSV を貼り付け（1列目: ラベル、2列目: 値）</p>
          <CsvUploadButton onParse={(rows) => {
            if (rows.length === 0) return
            onChange(parseRows(rows))
          }} />
        </div>
        <textarea
          ref={pasteRef}
          rows={5}
          className="w-full p-2 text-xs font-mono resize-y"
          style={{ ...inputStyle, borderRadius: 8 }}
          placeholder={'カテゴリA\t35\nカテゴリB\t28\nカテゴリC\t22'}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E7EB' }}
        />
        <button
          onClick={handlePaste}
          className="mt-1 w-full py-1.5 text-xs font-semibold text-white rounded-lg"
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

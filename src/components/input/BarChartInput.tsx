import { useRef } from 'react'
import type { BarChartData } from '../../types/figures'
import { parseCsv, toNum } from './DataInput/parseCsv'
import CsvUploadButton from '../common/CsvUploadButton'

interface Props {
  data: BarChartData
  onChange: (data: BarChartData, seriesLabels?: string[]) => void
}

const SAMPLE: BarChartData = {
  labels: ['A', 'B', 'C', 'D'],
  values: [4.2, 7.8, 3.1, 6.5],
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.15s',
  fontSize: 12,
}

export default function BarChartInput({ data, onChange }: Props) {
  const pasteRef = useRef<HTMLTextAreaElement>(null)

  const handlePaste = () => {
    const text = pasteRef.current?.value ?? ''
    const rows = parseCsv(text)
    if (rows.length === 0) return

    // 1列目 = カテゴリラベル, 残り列 = 系列値
    // ヘッダー行検出: 1行目の2列目以降が数値でなければヘッダー
    let startRow = 0
    const seriesNames: string[] = []
    if (rows.length > 1 && isNaN(toNum(rows[0][1] ?? ''))) {
      seriesNames.push(...rows[0].slice(1))
      startRow = 1
    }

    const dataRows = rows.slice(startRow)
    const labels   = dataRows.map((r) => r[0])
    const nSeries  = (dataRows[0]?.length ?? 1) - 1

    if (nSeries <= 1) {
      const values = dataRows.map((r) => toNum(r[1] ?? '0'))
      onChange({ labels, values }, seriesNames.length ? seriesNames : undefined)
    } else {
      const values = Array.from({ length: nSeries }, (_, si) =>
        dataRows.map((r) => toNum(r[si + 1] ?? '0'))
      )
      onChange({ labels, values }, seriesNames.length ? seriesNames : undefined)
    }

    if (pasteRef.current) pasteRef.current.value = ''
  }

  const isGrouped = Array.isArray(data.values[0])
  const nSeries   = isGrouped ? (data.values as number[][]).length : 1
  const cats      = data.labels

  return (
    <div className="space-y-3">
      {/* 現在のデータサマリー */}
      <div
        className="text-xs text-gray-500 px-3 py-2 rounded-lg"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
      >
        {cats.length} カテゴリ × {nSeries} 系列
      </div>

      {/* ペースト入力 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-gray-400">
            CSV / TSV を貼り付け（1列目: カテゴリ名、残り: 系列値）
          </p>
          <CsvUploadButton onParse={(rows) => {
            if (rows.length === 0) return
            let startRow = 0; const sn: string[] = []
            if (rows.length > 1 && isNaN(toNum(rows[0][1] ?? ''))) { sn.push(...rows[0].slice(1)); startRow = 1 }
            const dr = rows.slice(startRow); const labels = dr.map(r => r[0]); const ns = (dr[0]?.length ?? 1) - 1
            if (ns <= 1) onChange({ labels, values: dr.map(r => toNum(r[1] ?? '0')) }, sn.length ? sn : undefined)
            else onChange({ labels, values: Array.from({ length: ns }, (_, si) => dr.map(r => toNum(r[si + 1] ?? '0'))) }, sn.length ? sn : undefined)
          }} />
        </div>
        <textarea
          ref={pasteRef}
          rows={5}
          className="w-full p-2 text-xs font-mono resize-y"
          style={{ ...inputStyle, borderRadius: 8 }}
          placeholder={'A\t4.2\nB\t7.8\nC\t3.1'}
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

      {/* サンプル */}
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

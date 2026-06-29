import { useState, useCallback } from 'react'
import type { ErrorBarData, ErrorBarSeriesItem } from '../../types/figures'

interface Props {
  data: ErrorBarData
  onChange: (data: ErrorBarData) => void
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none',
}

function parseRow(raw: string): number[] {
  return raw.split(/[\s,、]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v))
}

function SeriesCard({ series, index, labels, total, onChangeSeries, onRemove }: {
  series: ErrorBarSeriesItem; index: number; labels: string[]; total: number
  onChangeSeries: (s: ErrorBarSeriesItem) => void; onRemove: () => void
}) {
  const [meansRaw, setMeansRaw] = useState(series.means.join(', '))
  const [errsRaw, setErrsRaw] = useState(series.errors.join(', '))

  const flush = (meansStr: string, errsStr: string) => {
    const means = parseRow(meansStr)
    const errors = parseRow(errsStr)
    onChangeSeries({ ...series, means, errors })
  }

  return (
    <div className="p-3 rounded-xl space-y-2" style={{ border: '1px solid #E5E7EB', background: '#FAFAFA' }}>
      <div className="flex items-center justify-between gap-2">
        <input
          value={series.name}
          onChange={(e) => onChangeSeries({ ...series, name: e.target.value })}
          placeholder={`Series ${index + 1}`}
          className="flex-1 text-sm px-2 py-1 font-medium"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB' }}
        />
        {total > 1 && (
          <button onClick={onRemove} className="text-xs px-2 py-1 rounded-lg"
            style={{ color: '#EF4444', border: '1px solid #FCA5A5', background: '#FFF5F5' }}>
            削除
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">平均値 ({labels.length} グループ)</label>
        <input
          type="text"
          value={meansRaw}
          onChange={(e) => setMeansRaw(e.target.value)}
          onBlur={(e) => { flush(e.target.value, errsRaw) }}
          placeholder={labels.map(() => '0').join(', ')}
          className="w-full text-sm px-2 py-1.5 font-mono"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">誤差 (SD / SE)</label>
        <input
          type="text"
          value={errsRaw}
          onChange={(e) => setErrsRaw(e.target.value)}
          onBlur={(e) => { flush(meansRaw, e.target.value) }}
          placeholder={labels.map(() => '0').join(', ')}
          className="w-full text-sm px-2 py-1.5 font-mono"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
        />
      </div>
    </div>
  )
}

export default function ErrorBarInput({ data, onChange }: Props) {
  const [labelsRaw, setLabelsRaw] = useState(data.labels.join(', '))

  const flushLabels = useCallback((raw: string) => {
    const labels = raw.split(/,\s*/).map((s) => s.trim()).filter(Boolean)
    if (labels.length === 0) return
    onChange({ ...data, labels })
  }, [data, onChange])

  const updateSeries = useCallback((i: number, s: ErrorBarSeriesItem) => {
    const next = [...data.series]; next[i] = s
    onChange({ ...data, series: next })
  }, [data, onChange])

  const addSeries = () => {
    onChange({ ...data, series: [...data.series, { name: `Series ${data.series.length + 1}`, means: Array(data.labels.length).fill(0), errors: Array(data.labels.length).fill(0) }] })
  }

  const removeSeries = (i: number) => {
    if (data.series.length <= 1) return
    onChange({ ...data, series: data.series.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">グループラベル (カンマ区切り)</label>
        <input
          type="text"
          value={labelsRaw}
          onChange={(e) => setLabelsRaw(e.target.value)}
          onBlur={(e) => flushLabels(e.target.value)}
          placeholder="条件A, 条件B, 条件C"
          className="w-full text-sm px-2 py-1.5 font-mono"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
        />
      </div>

      <div className="space-y-3">
        {data.series.map((s, i) => (
          <SeriesCard
            key={i}
            series={s}
            index={i}
            labels={data.labels}
            total={data.series.length}
            onChangeSeries={(updated) => updateSeries(i, updated)}
            onRemove={() => removeSeries(i)}
          />
        ))}
      </div>

      <button onClick={addSeries}
        className="w-full text-sm py-2 rounded-xl transition-all"
        style={{ border: '1.5px dashed #C4B5FD', color: '#6C63FF', background: 'white' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F3FF' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}>
        + 系列追加
      </button>
    </div>
  )
}

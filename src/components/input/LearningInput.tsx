import { useState } from 'react'
import type { LearningData, LearningSeriesItem } from '../../types/figures'
import CsvUploadButton from '../common/CsvUploadButton'

interface Props {
  data: LearningData
  onChange: (data: LearningData) => void
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none',
  transition: 'border-color 0.15s', fontSize: 12,
}

const btnPrimary = (hover: boolean): React.CSSProperties => ({
  background: hover ? '#5a52e0' : '#6C63FF',
  color: 'white', borderRadius: 8, padding: '6px 0', fontSize: 12,
  fontWeight: 600, width: '100%', cursor: 'pointer', border: 'none',
})

function parseCol(text: string): number[] {
  return text.split(/[\n,\t]+/).map(s => s.trim()).filter(Boolean)
    .map(Number).filter(n => !isNaN(n))
}

const SAMPLE: LearningData = {
  epochs: [1,2,3,4,5,6,7,8,9,10],
  series: [
    { label: 'Train loss',          values: [0.80,0.42,0.25,0.18,0.14,0.11,0.09,0.08,0.07,0.07], axis: 'left'  },
    { label: 'Validation accuracy', values: [0.68,0.75,0.79,0.82,0.84,0.85,0.86,0.87,0.87,0.88], axis: 'right' },
  ],
}

interface SeriesUIState {
  label: string
  axis: 'left' | 'right'
  valuesText: string
}

function initSeriesUI(data: LearningData): SeriesUIState[] {
  return data.series.map(s => ({
    label: s.label,
    axis: s.axis,
    valuesText: s.values.join('\n'),
  }))
}

export default function LearningInput({ data, onChange }: Props) {
  const [epochText, setEpochText] = useState(() => data.epochs.join('\n'))
  const [seriesUI, setSeriesUI] = useState<SeriesUIState[]>(() => initSeriesUI(data))
  const [hoverEpoch, setHoverEpoch] = useState(false)
  const [hoverApply, setHoverApply] = useState<number | null>(null)
  const [hoverAdd, setHoverAdd] = useState(false)
  const [hoverSample, setHoverSample] = useState(false)

  const updateSeries = (i: number, patch: Partial<SeriesUIState>) => {
    setSeriesUI(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))
  }

  const handleEpochApply = () => {
    const newEpochs = parseCol(epochText)
    const newSeries: LearningSeriesItem[] = seriesUI.map(s => ({
      label: s.label,
      values: parseCol(s.valuesText),
      axis: s.axis,
    }))
    onChange({ epochs: newEpochs, series: newSeries })
  }

  const handleSeriesApply = (_i: number) => {
    const newSeries: LearningSeriesItem[] = seriesUI.map(s => ({
      label: s.label,
      values: parseCol(s.valuesText),
      axis: s.axis,
    }))
    onChange({ epochs: parseCol(epochText), series: newSeries })
  }

  const handleAdd = () => {
    const n = seriesUI.length + 1
    setSeriesUI(prev => [...prev, { label: `Series ${n}`, axis: 'left', valuesText: '' }])
  }

  const handleRemove = (i: number) => {
    const next = seriesUI.filter((_, idx) => idx !== i)
    setSeriesUI(next)
    const newSeries: LearningSeriesItem[] = next.map(s => ({
      label: s.label,
      values: parseCol(s.valuesText),
      axis: s.axis,
    }))
    onChange({ epochs: parseCol(epochText), series: newSeries })
  }

  const handleSample = () => {
    setEpochText(SAMPLE.epochs.join('\n'))
    setSeriesUI(SAMPLE.series.map(s => ({
      label: s.label,
      axis: s.axis,
      valuesText: s.values.join('\n'),
    })))
    onChange(SAMPLE)
  }

  const handleCsvAll = (rows: string[][]) => {
    if (rows.length < 2) return
    const header = rows[0]; const dataRows = rows.slice(1)
    const epochs = dataRows.map(r => Number(r[0] ?? '0')).filter(n => !isNaN(n))
    const newSeries: LearningSeriesItem[] = Array.from({ length: header.length - 1 }, (_, si) => ({
      label: header[si + 1] ?? `Series ${si + 1}`,
      values: dataRows.map(r => Number(r[si + 1] ?? '0') || 0),
      axis: 'left' as const,
    }))
    setEpochText(epochs.join('\n'))
    setSeriesUI(newSeries.map(s => ({ label: s.label, axis: s.axis, valuesText: s.values.join('\n') })))
    onChange({ epochs, series: newSeries })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#6B7280' }}>CSV: 1列目=epoch, 残り=系列値（1行目ヘッダー）</span>
        <CsvUploadButton onParse={handleCsvAll} />
      </div>
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Epoch列</label>
        <textarea
          rows={4}
          value={epochText}
          onChange={e => setEpochText(e.target.value)}
          style={{ ...inputStyle, padding: '4px 8px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
        />
        <button
          onClick={handleEpochApply}
          onMouseEnter={() => setHoverEpoch(true)}
          onMouseLeave={() => setHoverEpoch(false)}
          style={btnPrimary(hoverEpoch)}
        >
          エポックを適用
        </button>
      </div>

      {seriesUI.map((s, i) => (
        <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>系列 {i + 1}</span>
            {seriesUI.length > 1 && (
              <button
                onClick={() => handleRemove(i)}
                style={{ fontSize: 11, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                削除
              </button>
            )}
          </div>
          <input
            type="text"
            value={s.label}
            onChange={e => updateSeries(i, { label: e.target.value })}
            placeholder="系列名"
            style={{ ...inputStyle, padding: '4px 8px', width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => updateSeries(i, { axis: 'left' })}
              style={{
                borderRadius: 6, padding: '4px 12px', fontSize: 11, cursor: 'pointer',
                background: s.axis === 'left' ? '#6C63FF' : '#F3F4F6',
                color: s.axis === 'left' ? 'white' : '#374151',
                border: s.axis === 'left' ? 'none' : '1px solid #E5E7EB',
                fontWeight: s.axis === 'left' ? 600 : 400,
              }}
            >
              左軸
            </button>
            <button
              onClick={() => updateSeries(i, { axis: 'right' })}
              style={{
                borderRadius: 6, padding: '4px 12px', fontSize: 11, cursor: 'pointer',
                background: s.axis === 'right' ? '#FF6584' : '#F3F4F6',
                color: s.axis === 'right' ? 'white' : '#374151',
                border: s.axis === 'right' ? 'none' : '1px solid #E5E7EB',
                fontWeight: s.axis === 'right' ? 600 : 400,
              }}
            >
              右軸
            </button>
          </div>
          <label style={{ fontSize: 11, color: '#6B7280' }}>Values列</label>
          <textarea
            rows={4}
            value={s.valuesText}
            onChange={e => updateSeries(i, { valuesText: e.target.value })}
            style={{ ...inputStyle, padding: '4px 8px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
          />
          <button
            onClick={() => handleSeriesApply(i)}
            onMouseEnter={() => setHoverApply(i)}
            onMouseLeave={() => setHoverApply(null)}
            style={btnPrimary(hoverApply === i)}
          >
            適用
          </button>
        </div>
      ))}

      <button
        onClick={handleAdd}
        onMouseEnter={() => setHoverAdd(true)}
        onMouseLeave={() => setHoverAdd(false)}
        style={{
          border: '1px dashed #6C63FF', borderRadius: 8, padding: '6px 0', fontSize: 12,
          color: hoverAdd ? '#5a52e0' : '#6C63FF', background: 'none', cursor: 'pointer', width: '100%',
        }}
      >
        ＋ 系列を追加
      </button>
      <button
        onClick={handleSample}
        onMouseEnter={() => setHoverSample(true)}
        onMouseLeave={() => setHoverSample(false)}
        style={{
          border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 0', fontSize: 12,
          color: '#6B7280', background: hoverSample ? '#F9FAFB' : 'white', cursor: 'pointer', width: '100%',
        }}
      >
        サンプルデータ
      </button>
    </div>
  )
}

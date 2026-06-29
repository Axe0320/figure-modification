import { useState } from 'react'
import type { FeatureData } from '../../types/figures'

interface Props {
  data: FeatureData
  onChange: (data: FeatureData) => void
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

const SAMPLE: FeatureData = {
  features:    ['Feature A','Feature B','Feature C','Feature D','Feature E','Feature F','Feature G','Feature H'],
  importances: [0.25, 0.18, 0.15, 0.12, 0.10, 0.08, 0.07, 0.05],
}

const SAMPLE_TEXT = SAMPLE.features.map((f, i) => `${f}\t${SAMPLE.importances[i]}`).join('\n')

function parseFeatureData(text: string): FeatureData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return { features: [], importances: [] }

  const features: string[] = []
  const importances: number[] = []

  let startIdx = 0
  const firstCols = lines[0].split(/[\t,]/)
  if (firstCols.length >= 2 && isNaN(Number(firstCols[1]))) {
    startIdx = 1
  }

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(/[\t,]/)
    if (cols.length < 2) continue
    const name = cols[0].trim()
    const val = Number(cols[1].trim())
    if (!isNaN(val)) {
      features.push(name)
      importances.push(val)
    }
  }

  return { features, importances }
}

export default function FeatureInput({ data, onChange }: Props) {
  const [text, setText] = useState(() =>
    data.features.map((f, i) => `${f}\t${data.importances[i]}`).join('\n')
  )
  const [hoverApply, setHoverApply] = useState(false)
  const [hoverSample, setHoverSample] = useState(false)

  const handleApply = () => {
    const parsed = parseFeatureData(text)
    onChange(parsed)
  }

  const handleSample = () => {
    setText(SAMPLE_TEXT)
    onChange(SAMPLE)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>
        CSV/TSV（1列目: 特徴量名、2列目: 重要度）
      </p>
      <textarea
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ ...inputStyle, padding: '6px 8px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
      />
      <div style={{ fontSize: 11, color: '#9CA3AF' }}>
        {data.features.length} 件
      </div>
      <button
        onClick={handleApply}
        onMouseEnter={() => setHoverApply(true)}
        onMouseLeave={() => setHoverApply(false)}
        style={btnPrimary(hoverApply)}
      >
        データを適用
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

import { useState } from 'react'
import HeatmapManualInput from './DataInput/HeatmapManualInput'
import CorrelationPaste from './DataInput/CorrelationPaste'

interface Props {
  data: number[][]
  onDataChange: (data: number[][], labels?: { x: string[], y: string[] }) => void
}

type InputMode = 'manual' | 'paste'

const TABS: { key: InputMode; label: string }[] = [
  { key: 'manual', label: '手入力' },
  { key: 'paste',  label: '行列貼り付け' },
]

export default function HeatmapCreateMode({ data, onDataChange }: Props) {
  const [mode, setMode] = useState<InputMode>('manual')

  const handlePaste = (parsed: number[][], labels: string[] | null) => {
    if (labels) {
      const rows = parsed.length
      const cols = parsed[0]?.length ?? 0
      const labelsX = labels.slice(0, cols)
      const labelsY = rows === cols && labels.length === rows
        ? labels  // square matrix: same labels for both axes
        : labels.slice(0, rows)
      onDataChange(parsed, { x: labelsX, y: labelsY })
    } else {
      onDataChange(parsed)
    }
    setMode('manual')
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className="px-3 py-1.5 text-xs font-semibold border-b-2 -mb-px transition-colors"
            style={{
              borderBottomColor: mode === t.key ? '#6C63FF' : 'transparent',
              color: mode === t.key ? '#6C63FF' : '#6B7280',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === 'manual' && (
        <HeatmapManualInput data={data} onChange={onDataChange} />
      )}
      {mode === 'paste' && (
        <CorrelationPaste onParse={handlePaste} />
      )}
    </div>
  )
}

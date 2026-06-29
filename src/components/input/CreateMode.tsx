import { useState } from 'react'
import ManualInput from './DataInput/ManualInput'
import SklearnPaste from './DataInput/SklearnPaste'

interface Props {
  data: number[][]
  onDataChange: (data: number[][]) => void
}

type InputMode = 'manual' | 'sklearn'

const TABS: { key: InputMode; label: string }[] = [
  { key: 'manual',  label: '手入力' },
  { key: 'sklearn', label: 'sklearn 貼り付け' },
]

export default function CreateMode({ data, onDataChange }: Props) {
  const [mode, setMode] = useState<InputMode>('manual')

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
        <ManualInput data={data} onChange={onDataChange} />
      )}
      {mode === 'sklearn' && (
        <SklearnPaste onParse={(d) => { onDataChange(d); setMode('manual') }} />
      )}
    </div>
  )
}

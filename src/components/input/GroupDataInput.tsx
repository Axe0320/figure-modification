import { useState, useCallback } from 'react'

interface Props {
  groups: number[][]
  labels: string[]
  onChange: (groups: number[][], labels: string[]) => void
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none',
}

function parseNumbers(raw: string): number[] {
  return raw.split(/[\s,、]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v))
}

export default function GroupDataInput({ groups, labels, onChange }: Props) {
  const [rawValues, setRawValues] = useState<string[]>(() => groups.map((g) => g.join(', ')))

  const handleLabelChange = useCallback((i: number, val: string) => {
    const next = [...labels]; next[i] = val; onChange(groups, next)
  }, [groups, labels, onChange])

  const handleValuesBlur = useCallback((i: number, raw: string) => {
    const nums = parseNumbers(raw)
    const nextGroups = [...groups]; nextGroups[i] = nums
    onChange(nextGroups, labels)
  }, [groups, labels, onChange])

  const handleValuesChange = useCallback((i: number, raw: string) => {
    const next = [...rawValues]; next[i] = raw; setRawValues(next)
  }, [rawValues])

  const addGroup = () => {
    const i = groups.length
    const nextLabels = [...labels, `Group ${i + 1}`]
    const nextGroups = [...groups, []]
    setRawValues((prev) => [...prev, ''])
    onChange(nextGroups, nextLabels)
  }

  const removeGroup = (i: number) => {
    if (groups.length <= 1) return
    const nextGroups = groups.filter((_, idx) => idx !== i)
    const nextLabels = labels.filter((_, idx) => idx !== i)
    setRawValues((prev) => prev.filter((_, idx) => idx !== i))
    onChange(nextGroups, nextLabels)
  }

  return (
    <div className="space-y-3">
      {groups.map((_, i) => (
        <div key={i} className="p-3 rounded-xl" style={{ border: '1px solid #E5E7EB', background: '#FAFAFA' }}>
          <div className="flex items-center justify-between mb-2 gap-2">
            <input
              value={labels[i] ?? `Group ${i + 1}`}
              onChange={(e) => handleLabelChange(i, e.target.value)}
              placeholder={`Group ${i + 1}`}
              className="flex-1 text-sm px-2 py-1 font-medium"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB' }}
            />
            {groups.length > 1 && (
              <button onClick={() => removeGroup(i)}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ color: '#EF4444', border: '1px solid #FCA5A5', background: '#FFF5F5' }}>
                削除
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={rawValues[i] ?? groups[i].join(', ')}
            onChange={(e) => handleValuesChange(i, e.target.value)}
            onBlur={(e) => handleValuesBlur(i, e.target.value)}
            placeholder="数値をカンマ・スペース区切りで入力 (例: 1.2, 3.4, 5.6)"
            className="w-full text-sm px-2 py-1.5 resize-y font-mono"
            style={{ ...inputStyle, lineHeight: 1.5, minHeight: 64 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
          />
          <p className="text-xs text-gray-400 mt-1">{groups[i].length} 件</p>
        </div>
      ))}

      <button onClick={addGroup}
        className="w-full text-sm py-2 rounded-xl transition-all"
        style={{ border: '1.5px dashed #C4B5FD', color: '#6C63FF', background: 'white' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F3FF' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}>
        + グループ追加
      </button>
    </div>
  )
}

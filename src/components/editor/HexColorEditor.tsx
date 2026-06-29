interface Props {
  value: string
  onChange: (color: string) => void
}

const PRESETS = [
  '#6C63FF', '#FF6584', '#43CFAA', '#FFB347', '#5BC0EB', '#C879FF',
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#374151', '#6B7280', '#9CA3AF', '#000000',
]

export default function HexColorEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            style={{
              width: 20, height: 20, borderRadius: 4, background: c,
              border: c.toLowerCase() === value.toLowerCase()
                ? '2px solid #6C63FF' : '1px solid #D1D5DB',
              cursor: 'pointer', flexShrink: 0,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="shrink-0 cursor-pointer"
          style={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 6, padding: 2 }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) onChange(e.target.value) }}
          className="flex-1 text-xs px-2 py-1 font-mono"
          style={{ border: '1px solid #E5E7EB', borderRadius: 6, outline: 'none', transition: 'border-color 0.15s' }}
          maxLength={7}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB' }}
        />
      </div>
    </div>
  )
}

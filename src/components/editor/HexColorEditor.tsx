interface Props {
  value: string
  onChange: (color: string) => void
}

export default function HexColorEditor({ value, onChange }: Props) {
  return (
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
  )
}

export const PALETTES: { label: string; colors: string[] }[] = [
  { label: 'デフォルト', colors: ['#6C63FF', '#FF6584', '#43CFAA', '#FFB347', '#5BC0EB', '#C879FF'] },
  { label: '学術',       colors: ['#6BAE9E', '#E8956D', '#7B91C2', '#C9B45C', '#A87DC0', '#E07C8A'] },
  { label: 'パステル',   colors: ['#AED6F1', '#A9DFBF', '#FAD7A0', '#F1948A', '#D7BDE2', '#FDEBD0'] },
  { label: 'ビビッド',   colors: ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'] },
]

export function PaletteButtons({ onChange }: { onChange: (colors: string[]) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">カラーパレット</label>
      <div className="flex gap-1 flex-wrap">
        {PALETTES.map(({ label, colors }) => (
          <button
            key={label}
            onClick={() => onChange(colors)}
            className="text-xs px-2.5 py-1 rounded-lg transition-all"
            style={{ border: '1px solid #E5E7EB', background: 'white', color: '#374151' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F5F3FF'
              e.currentTarget.style.borderColor = '#C4B5FD'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = '#E5E7EB'
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

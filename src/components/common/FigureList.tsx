import { useState, useRef, useEffect } from 'react'
import type { FigureState, FigureType } from '../../types/figures'

interface Props {
  figures: FigureState[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (type: FigureType) => void
}

const TYPE_LABEL: Record<FigureType, string> = {
  confusion_matrix: 'CM',
  heatmap: 'HM',
}
const TYPE_FULL: Record<FigureType, string> = {
  confusion_matrix: '混合行列',
  heatmap: 'ヒートマップ',
}

export default function FigureList({ figures, selectedId, onSelect, onDelete, onAdd }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 overflow-x-auto">
      {figures.map((fig, i) => {
        const selected = fig.id === selectedId
        return (
          <button
            key={fig.id}
            onClick={() => onSelect(fig.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs shrink-0 transition-all"
            style={{
              background: selected ? '#EEF2FF' : '#F9FAFB',
              border: selected ? '1px solid #C4B5FD' : '1px solid #E5E7EB',
              color: selected ? '#6C63FF' : '#374151',
            }}
            title={TYPE_FULL[fig.type]}
          >
            <span className="font-medium">{i + 1}</span>
            <span>{TYPE_LABEL[fig.type]}</span>
            {figures.length > 1 && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onDelete(fig.id) }}
                className="ml-0.5 leading-none"
                style={{ color: selected ? '#A78BFA' : '#9CA3AF' }}
              >
                ×
              </span>
            )}
          </button>
        )
      })}

      {/* Add button */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
          style={{
            border: '1px dashed #C4B5FD',
            color: '#6C63FF',
            background: showMenu ? '#EEF2FF' : 'white',
          }}
          title="図を追加"
        >
          ＋
        </button>
        {showMenu && (
          <div
            className="absolute top-full left-0 mt-1 bg-white rounded-lg z-20 py-1"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,.12)', border: '1px solid #E5E7EB', minWidth: 120 }}
          >
            {(['confusion_matrix', 'heatmap'] as FigureType[]).map((t) => (
              <button
                key={t}
                onClick={() => { onAdd(t); setShowMenu(false) }}
                className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                {TYPE_FULL[t]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

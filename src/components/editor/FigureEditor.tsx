import { useState } from 'react'
import type { ConfusionMatrixState, ConfusionMatrixParams } from '../../types/figures'
import TextEditor from './TextEditor'
import ColorEditor from './ColorEditor'
import LabelEditor from './LabelEditor'
import SizeEditor from './SizeEditor'

interface Props {
  figure: ConfusionMatrixState
  onChange: (patch: Partial<ConfusionMatrixParams>) => void
}

type Section = 'text' | 'color' | 'label' | 'size'

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'text',  label: 'テキスト' },
  { key: 'color', label: 'カラー' },
  { key: 'label', label: 'ラベル' },
  { key: 'size',  label: 'サイズ' },
]

export default function FigureEditor({ figure, onChange }: Props) {
  const [open, setOpen] = useState<Section>('text')

  const toggle = (s: Section) => setOpen((prev) => prev === s ? 'text' : s)

  return (
    <div className="space-y-1">
      {SECTIONS.map(({ key, label }) => (
        <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(key)}
            className="w-full flex justify-between items-center px-3 py-2 text-sm font-medium
              text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {label}
            <span className="text-gray-400">{open === key ? '▲' : '▼'}</span>
          </button>
          {open === key && (
            <div className="px-3 pb-3 pt-1 border-t border-gray-100">
              {key === 'text'  && (
                <TextEditor
                  params={figure.params}
                  onChange={(p) => onChange(p as Partial<ConfusionMatrixParams>)}
                />
              )}
              {key === 'color' && (
                <ColorEditor
                  colormap={figure.params.colormap}
                  onChange={(colormap) => onChange({ colormap })}
                />
              )}
              {key === 'label' && (
                <LabelEditor
                  params={figure.params}
                  matrixSize={figure.data.length}
                  onChange={onChange}
                />
              )}
              {key === 'size'  && (
                <SizeEditor
                  params={figure.params}
                  onChange={(p) => onChange(p as Partial<ConfusionMatrixParams>)}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

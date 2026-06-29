import { useState, useEffect } from 'react'
import type { OcrProvider } from '../../hooks/useOcr'

interface Props {
  onClose: () => void
}

const PROVIDERS: { key: string; provider: OcrProvider; label: string; placeholder: string }[] = [
  { key: 'ocr_anthropic_key', provider: 'claude',  label: 'Anthropic (Claude Vision)', placeholder: 'sk-ant-...' },
  { key: 'ocr_openai_key',    provider: 'openai',  label: 'OpenAI (GPT-4o Vision)',    placeholder: 'sk-...' },
  { key: 'ocr_google_key',    provider: 'gemini',  label: 'Google (Gemini)',            placeholder: 'AIza...' },
]

export default function OcrSettings({ onClose }: Props) {
  const [keys, setKeys]   = useState<Record<string, string>>({})
  const [show, setShow]   = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loaded: Record<string, string> = {}
    PROVIDERS.forEach(p => { loaded[p.key] = localStorage.getItem(p.key) ?? '' })
    setKeys(loaded)
  }, [])

  const handleSave = () => {
    PROVIDERS.forEach(p => {
      if (keys[p.key]?.trim()) localStorage.setItem(p.key, keys[p.key].trim())
      else localStorage.removeItem(p.key)
    })
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 70 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl p-6 w-96"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Vision API キー設定</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          キーはブラウザの localStorage にのみ保存されます。サーバーには送信されません。
        </p>

        <div className="space-y-3">
          {PROVIDERS.map(p => (
            <div key={p.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{p.label}</label>
              <div className="flex gap-1">
                <input
                  type={show[p.key] ? 'text' : 'password'}
                  value={keys[p.key] ?? ''}
                  onChange={e => setKeys(prev => ({ ...prev, [p.key]: e.target.value }))}
                  placeholder={p.placeholder}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg font-mono"
                  style={{ border: '1px solid #E5E7EB', outline: 'none' }}
                />
                <button
                  onClick={() => setShow(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: '#F9FAFB' }}
                >
                  {show[p.key] ? '隠す' : '表示'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="text-xs px-4 py-1.5 rounded-lg text-white font-semibold"
            style={{ background: saved ? '#10B981' : '#6C63FF' }}
          >
            {saved ? '保存しました ✓' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

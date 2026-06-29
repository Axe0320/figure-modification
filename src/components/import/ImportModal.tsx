import { useState, useRef, useCallback, useEffect } from 'react'
import type { FigureType } from '../../types/figures'
import { useOcr, type OcrProvider } from '../../hooks/useOcr'
import OcrConfirm from './OcrConfirm'
import PointDigitizer, { type DigitizerSeries } from './PointDigitizer'

interface Props {
  onApply: (type: FigureType, dataPatch: unknown, paramsPatch: Record<string, unknown>) => void
  onClose: () => void
}

type Step = 'upload' | 'digitize' | 'confirm'

const ALL_TYPES: FigureType[] = [
  'bar_chart', 'line_plot', 'scatter_plot', 'histogram',
  'roc_curve', 'pr_curve', 'learning_curve', 'feature_importance',
  'box_plot', 'violin_plot', 'error_bar',
  'confusion_matrix', 'heatmap',
]

const TYPE_JA: Record<FigureType, string> = {
  confusion_matrix: '混合行列',
  heatmap: 'ヒートマップ',
  bar_chart: '棒グラフ',
  line_plot: '折れ線グラフ',
  scatter_plot: '散布図',
  histogram: 'ヒストグラム',
  roc_curve: 'ROC曲線',
  pr_curve: 'PR曲線',
  learning_curve: '学習曲線',
  feature_importance: '特徴量重要度',
  box_plot: '箱ひげ図',
  violin_plot: 'バイオリンプロット',
  error_bar: 'エラーバー',
}

const PROVIDERS: { value: OcrProvider; label: string }[] = [
  { value: 'claude',  label: 'Claude (Anthropic)' },
  { value: 'openai',  label: 'GPT-4o (OpenAI)' },
  { value: 'gemini',  label: 'Gemini (Google)' },
]

// line/scatter need manual digitization, not OCR
const DIGITIZE_TYPES: FigureType[] = ['line_plot', 'scatter_plot']

export default function ImportModal({ onApply, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep]           = useState<Step>('upload')
  const [imageUrl, setImageUrl]   = useState<string | null>(null)
  const [imageB64, setImageB64]   = useState<string | null>(null)
  const [figType, setFigType]     = useState<FigureType>('bar_chart')
  const [provider, setProvider]   = useState<OcrProvider>('claude')
  const [dragging, setDragging]   = useState(false)

  const { status, extracted, error, run, reset } = useOcr()

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const url = e.target?.result as string
      setImageUrl(url)
      // strip data:image/xxx;base64, prefix
      setImageB64(url.split(',')[1] ?? null)
      reset()
    }
    reader.readAsDataURL(file)
  }, [reset])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }, [loadFile])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  const handleAnalyze = async () => {
    if (!imageB64) return
    if (DIGITIZE_TYPES.includes(figType)) {
      setStep('digitize')
      return
    }
    await run(imageB64, figType, provider)
  }

  const [manualExtracted, setManualExtracted] = useState<Record<string, unknown> | null>(null)

  // When OCR finishes, switch to confirm step
  useEffect(() => {
    if (status === 'done' && extracted) {
      setManualExtracted(null)
      setStep('confirm')
    }
  }, [status, extracted])

  const handleDigitizerComplete = (series: DigitizerSeries[]) => {
    const synth = { series: series.map(s => ({ name: s.name, x: s.x, y: s.y })) }
    setManualExtracted(synth)
    setStep('confirm')
  }

  const activeExtracted = extracted ?? manualExtracted ?? {}

  const handleApply = (type: FigureType, data: unknown, paramsPatch: Record<string, unknown>) => {
    onApply(type, data, paramsPatch)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', zIndex: 60 }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="bg-white rounded-2xl flex flex-col"
          style={{
            width: step === 'digitize' ? '92vw' : 640,
            height: step === 'digitize' ? '90vh' : 'auto',
            maxHeight: '90vh',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            padding: 24,
            overflow: 'hidden',
          }}
        >
          {/* ---- upload step ---- */}
          {step === 'upload' && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-800">図を読み込む (OCR)</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
              </div>

              {/* drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                style={{
                  border: `2px dashed ${dragging ? '#6C63FF' : '#D1D5DB'}`,
                  background: dragging ? '#F0EFFE' : '#F9FAFB',
                  minHeight: imageUrl ? 160 : 200,
                  padding: 16,
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="preview"
                    style={{ maxHeight: 140, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                  />
                ) : (
                  <>
                    <span style={{ fontSize: 36 }}>🖼️</span>
                    <p className="text-sm text-gray-500 mt-2">画像をドロップ、またはクリックして選択</p>
                    <p className="text-xs text-gray-400 mt-1">PNG / JPG / WebP</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />

              {/* figure type selector */}
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold text-gray-600">図の種類</label>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {ALL_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setFigType(t)}
                      className="text-xs py-1.5 px-2 rounded-lg font-medium transition-colors"
                      style={{
                        background: figType === t ? '#6C63FF' : '#F3F4F6',
                        color: figType === t ? 'white' : '#374151',
                        border: figType === t ? 'none' : '1px solid transparent',
                      }}
                    >
                      {TYPE_JA[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* provider (only for non-digitize types) */}
              {!DIGITIZE_TYPES.includes(figType) && (
                <div className="mt-3 space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Vision AI</label>
                  <div className="flex gap-2">
                    {PROVIDERS.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setProvider(p.value)}
                        className="text-xs py-1 px-3 rounded-lg transition-colors"
                        style={{
                          background: provider === p.value ? '#6C63FF' : '#F3F4F6',
                          color: provider === p.value ? 'white' : '#374151',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {DIGITIZE_TYPES.includes(figType) && (
                <p className="text-xs text-blue-600 mt-2">
                  この図種はCanvas上で手動点取りを行います（Vision AIは使いません）
                </p>
              )}

              {error && (
                <p className="text-xs text-red-500 mt-2 p-2 rounded-lg" style={{ background: '#FEF2F2' }}>
                  {error}
                </p>
              )}

              {/* footer */}
              <div className="flex gap-2 justify-end mt-5">
                <button
                  onClick={onClose}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!imageUrl || status === 'processing'}
                  className="text-xs px-5 py-1.5 rounded-lg text-white font-semibold"
                  style={{
                    background: (!imageUrl || status === 'processing') ? '#A78BFA' : '#6C63FF',
                    cursor: (!imageUrl || status === 'processing') ? 'not-allowed' : 'pointer',
                  }}
                >
                  {status === 'processing'
                    ? '解析中...'
                    : DIGITIZE_TYPES.includes(figType)
                      ? '手動点取りを開始'
                      : '解析開始'}
                </button>
              </div>
            </>
          )}

          {/* ---- digitize step ---- */}
          {step === 'digitize' && imageUrl && (
            <PointDigitizer
              imageUrl={imageUrl}
              onComplete={handleDigitizerComplete}
              onCancel={() => setStep('upload')}
            />
          )}

          {/* ---- confirm step ---- */}
          {step === 'confirm' && imageUrl && (
            <OcrConfirm
              type={figType}
              extracted={activeExtracted as Record<string, unknown>}
              imageUrl={imageUrl}
              onApply={handleApply}
              onBack={() => { setStep('upload'); reset() }}
              onClose={onClose}
            />
          )}
        </div>
      </div>

    </>
  )
}

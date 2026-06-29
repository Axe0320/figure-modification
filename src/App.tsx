import { useCallback, useEffect, useState } from 'react'
import type { ConfusionMatrixParams, ConfusionMatrixState } from './types/figures'
import { useFigureStore } from './store/figureStore'
import { getPreview } from './cache/previewCache'
import { debouncedRender, renderAndCache } from './api/figureApi'
import CreateMode from './components/input/CreateMode'
import FigureEditor from './components/editor/FigureEditor'
import FigurePreview from './components/preview/FigurePreview'

const DEFAULT_FIGURE: ConfusionMatrixState = {
  id: 'fig-1',
  type: 'confusion_matrix',
  data: [[45, 3], [2, 50]],
  params: {
    title: '',
    fontsize: 12,
    figsize_cm: [12, 10],
    dpi: 150,
    colormap: 'Blues',
    normalize: false,
    labels: ['Class 0', 'Class 1'],
    show_values: true,
    xlabel: 'Predicted Label',
    ylabel: 'True Label',
    xlabel_top: true,
    linewidths: 0.5,
    linecolor: 'white',
  },
}

export default function App() {
  const { figures, addFigure, updateFigure } = useFigureStore()
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const figure = (figures[0] as ConfusionMatrixState | undefined) ?? null

  useEffect(() => {
    if (!figures.length) addFigure(DEFAULT_FIGURE)
  }, [])

  useEffect(() => {
    if (!figure) return
    const cached = getPreview(figure.id)
    if (cached) { setPreview(cached); return }
    setLoading(true)
    renderAndCache(figure)
      .then((b64) => { setPreview(b64); setError(null) })
      .catch((e)  => setError(e.message))
      .finally(()  => setLoading(false))
  }, [])

  const handleDataChange = useCallback((data: number[][]) => {
    if (!figure) return
    const newN = data.length
    const oldN = figure.data.length
    if (newN !== oldN) {
      const newLabels = Array.from({ length: newN }, (_, i) =>
        figure.params.labels[i] ?? `Class ${i}`
      )
      updateFigure(figure.id, (f) => ({
        ...f,
        data,
        params: { ...(f as ConfusionMatrixState).params, labels: newLabels },
      } as ConfusionMatrixState))
    } else {
      updateFigure(figure.id, (f) => ({ ...f, data } as ConfusionMatrixState))
    }
  }, [figure, updateFigure])

  const handleParamsChange = useCallback((patch: Partial<ConfusionMatrixParams>) => {
    if (!figure) return
    updateFigure(figure.id, (f) => ({
      ...f,
      params: { ...(f as ConfusionMatrixState).params, ...patch },
    } as ConfusionMatrixState))
  }, [figure, updateFigure])

  useEffect(() => {
    if (!figure) return
    setLoading(true)
    setError(null)
    debouncedRender(
      figure,
      (b64: string) => { setPreview(b64); setLoading(false) },
      (msg: string) => { setError(msg); setLoading(false) },
    )
  }, [figure?.data, figure?.params])

  const handleDownload = () => {
    if (!preview) return
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${preview}`
    a.download = `${figure?.params.title || 'figure'}.png`
    a.click()
  }

  if (!figure) return null

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <header
        className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity=".9"/>
            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity=".6"/>
            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity=".6"/>
            <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity=".9"/>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-800 leading-none">Figure Modification</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">混合行列エディタ</p>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* 左パネル */}
        <div
          className="w-80 flex-shrink-0 bg-white flex flex-col overflow-y-auto"
          style={{ borderRight: '1px solid #E5E7EB', boxShadow: '2px 0 8px rgba(0,0,0,.04)' }}
        >
          <section className="p-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              データ入力
            </p>
            <CreateMode data={figure.data} onDataChange={handleDataChange} />
          </section>

          <section className="p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              パラメータ
            </p>
            <FigureEditor figure={figure} onChange={handleParamsChange} />
          </section>
        </div>

        {/* 右パネル */}
        <div className="flex-1 p-6 flex flex-col">
          <FigurePreview
            b64={preview}
            loading={loading}
            error={error}
            onDownload={handleDownload}
          />
        </div>
      </main>
    </div>
  )
}

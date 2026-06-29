import { useCallback, useEffect, useRef, useState } from 'react'
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
    updateFigure(figure.id, (f) => ({ ...f, data } as ConfusionMatrixState))
  }, [figure, updateFigure])

  const handleParamsChange = useCallback((patch: Partial<ConfusionMatrixParams>) => {
    if (!figure) return
    updateFigure(figure.id, (f) => ({
      ...f,
      params: { ...(f as ConfusionMatrixState).params, ...patch },
    } as ConfusionMatrixState))
  }, [figure, updateFigure])

  const latestFigureRef = useRef(figure)
  latestFigureRef.current = figure

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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-800">Figure Modification</h1>
        <p className="text-xs text-gray-400">混合行列エディタ</p>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* 左パネル */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
          <section className="p-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              データ入力
            </h2>
            <CreateMode data={figure.data} onDataChange={handleDataChange} />
          </section>

          <section className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              パラメータ
            </h2>
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

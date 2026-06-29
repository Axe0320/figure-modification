import { useCallback, useEffect, useState } from 'react'
import type {
  FigureType,
  ConfusionMatrixParams,
  ConfusionMatrixState,
  HeatmapParams,
  HeatmapState,
  FigureState,
} from './types/figures'
import { useFigureStore } from './store/figureStore'
import { getPreview } from './cache/previewCache'
import { debouncedRender, renderAndCache } from './api/figureApi'
import CreateMode from './components/input/CreateMode'
import HeatmapCreateMode from './components/input/HeatmapCreateMode'
import FigureEditor from './components/editor/FigureEditor'
import HeatmapEditor from './components/editor/HeatmapEditor'
import FigurePreview from './components/preview/FigurePreview'

const DEFAULT_CM: ConfusionMatrixState = {
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
    linewidths: 0.1,
    linecolor: 'black',
    annot_fontsize: 11,
    tick_fontsize: 11,
    cell_size_cm: null,
  },
}

const DEFAULT_HEATMAP: HeatmapState = {
  id: 'fig-1',
  type: 'heatmap',
  data: [
    [1.00, 0.80, 0.30],
    [0.80, 1.00, 0.50],
    [0.30, 0.50, 1.00],
  ],
  params: {
    title: '',
    fontsize: 12,
    figsize_cm: [12, 10],
    dpi: 150,
    mode: 'heatmap',
    colormap: 'Blues',
    labels_x: ['A', 'B', 'C'],
    labels_y: ['A', 'B', 'C'],
    show_values: true,
    fmt: '.2f',
    vmin: null,
    vmax: null,
    mask_upper: false,
    xlabel: '',
    ylabel: '',
    linewidths: 0.5,
    linecolor: 'white',
    annot_fontsize: 10,
    tick_fontsize: 10,
    cell_size_cm: null,
  },
}

const FIGURE_TYPES: { type: FigureType; label: string; subtitle: string }[] = [
  { type: 'confusion_matrix', label: '混合行列',     subtitle: '混合行列エディタ' },
  { type: 'heatmap',          label: 'ヒートマップ', subtitle: 'ヒートマップエディタ' },
]

export default function App() {
  const { figures, addFigure, updateFigure } = useFigureStore()
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const figure = (figures[0] as FigureState | undefined) ?? null

  useEffect(() => {
    if (!figures.length) addFigure(DEFAULT_CM)
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

  useEffect(() => {
    if (!figure) return
    setLoading(true)
    setError(null)
    debouncedRender(
      figure,
      (b64: string) => { setPreview(b64); setLoading(false) },
      (msg: string) => { setError(msg);   setLoading(false) },
    )
  }, [figure?.data, figure?.params])

  // ---------------------------------------------------------------- type switch
  const handleTypeSwitch = useCallback((type: FigureType) => {
    if (figure?.type === type) return
    const next = type === 'confusion_matrix' ? DEFAULT_CM : DEFAULT_HEATMAP
    updateFigure('fig-1', () => next)
    setPreview(null)
  }, [figure, updateFigure])

  // ----------------------------------------------------------- confusion matrix
  const handleCMDataChange = useCallback((data: number[][]) => {
    if (!figure || figure.type !== 'confusion_matrix') return
    const newN = data.length
    const oldN = figure.data.length
    if (newN !== oldN) {
      const newLabels = Array.from({ length: newN }, (_, i) =>
        figure.params.labels[i] ?? `Class ${i}`
      )
      updateFigure(figure.id, (f) => ({
        ...f, data,
        params: { ...(f as ConfusionMatrixState).params, labels: newLabels },
      } as ConfusionMatrixState))
    } else {
      updateFigure(figure.id, (f) => ({ ...f, data } as ConfusionMatrixState))
    }
  }, [figure, updateFigure])

  const handleCMParamsChange = useCallback((patch: Partial<ConfusionMatrixParams>) => {
    if (!figure || figure.type !== 'confusion_matrix') return
    updateFigure(figure.id, (f) => ({
      ...f,
      params: { ...(f as ConfusionMatrixState).params, ...patch },
    } as ConfusionMatrixState))
  }, [figure, updateFigure])

  const handleCMReset = useCallback(() => {
    if (!figure || figure.type !== 'confusion_matrix') return
    updateFigure(figure.id, (f) => ({ ...f, params: DEFAULT_CM.params } as ConfusionMatrixState))
  }, [figure, updateFigure])

  // --------------------------------------------------------------- heatmap
  const handleHMDataChange = useCallback((
    data: number[][],
    extractedLabels?: { x: string[], y: string[] },
  ) => {
    if (!figure || figure.type !== 'heatmap') return
    const newRows = data.length
    const newCols = data[0]?.length ?? 0
    const labelsX = extractedLabels?.x ??
      Array.from({ length: newCols }, (_, i) => figure.params.labels_x[i] ?? `Col ${i}`)
    const labelsY = extractedLabels?.y ??
      Array.from({ length: newRows }, (_, i) => figure.params.labels_y[i] ?? `Row ${i}`)
    updateFigure(figure.id, (f) => ({
      ...f, data,
      params: { ...(f as HeatmapState).params, labels_x: labelsX, labels_y: labelsY },
    } as HeatmapState))
  }, [figure, updateFigure])

  const handleHMParamsChange = useCallback((patch: Partial<HeatmapParams>) => {
    if (!figure || figure.type !== 'heatmap') return
    updateFigure(figure.id, (f) => ({
      ...f,
      params: { ...(f as HeatmapState).params, ...patch },
    } as HeatmapState))
  }, [figure, updateFigure])

  const handleHMReset = useCallback(() => {
    if (!figure || figure.type !== 'heatmap') return
    updateFigure(figure.id, (f) => ({ ...f, params: DEFAULT_HEATMAP.params } as HeatmapState))
  }, [figure, updateFigure])

  // --------------------------------------------------------------- download
  const handleDownload = () => {
    if (!preview) return
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${preview}`
    a.download = `${figure?.params.title || 'figure'}.png`
    a.click()
  }

  if (!figure) return null

  const currentTypeMeta = FIGURE_TYPES.find((t) => t.type === figure.type) ?? FIGURE_TYPES[0]

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
          <p className="text-[11px] text-gray-400 mt-0.5">{currentTypeMeta.subtitle}</p>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* 左パネル */}
        <div
          className="w-80 flex-shrink-0 bg-white flex flex-col overflow-y-auto"
          style={{ borderRight: '1px solid #E5E7EB', boxShadow: '2px 0 8px rgba(0,0,0,.04)' }}
        >
          {/* 図種選択 */}
          <div className="flex border-b border-gray-200 px-3 pt-3">
            {FIGURE_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => handleTypeSwitch(t.type)}
                className="flex-1 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors"
                style={{
                  borderBottomColor: figure.type === t.type ? '#6C63FF' : 'transparent',
                  color: figure.type === t.type ? '#6C63FF' : '#6B7280',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <section className="p-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              データ入力
            </p>
            {figure.type === 'confusion_matrix' ? (
              <CreateMode data={figure.data} onDataChange={handleCMDataChange} />
            ) : (
              <HeatmapCreateMode data={figure.data} onDataChange={handleHMDataChange} />
            )}
          </section>

          <section className="p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              パラメータ
            </p>
            {figure.type === 'confusion_matrix' ? (
              <FigureEditor
                figure={figure as ConfusionMatrixState}
                onChange={handleCMParamsChange}
                onReset={handleCMReset}
              />
            ) : (
              <HeatmapEditor
                figure={figure as HeatmapState}
                onChange={handleHMParamsChange}
                onReset={handleHMReset}
              />
            )}
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

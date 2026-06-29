import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  FigureType,
  ConfusionMatrixParams, ConfusionMatrixState,
  HeatmapParams,         HeatmapState,
  BarChartParams,        BarChartState,
  LinePlotParams,        LinePlotState,
  ScatterParams,         ScatterState,
  HistogramParams,       HistogramState,
} from './types/figures'
import { useFigureStore } from './store/figureStore'
import { getPreview } from './cache/previewCache'
import { savePreview } from './storage/db'
import { debouncedRender, renderAndCache, composeAndExport } from './api/figureApi'
import CreateMode from './components/input/CreateMode'
import HeatmapCreateMode from './components/input/HeatmapCreateMode'
import BarChartInput from './components/input/BarChartInput'
import LinePlotInput from './components/input/LinePlotInput'
import ScatterInput from './components/input/ScatterInput'
import HistogramInput from './components/input/HistogramInput'
import FigureEditor from './components/editor/FigureEditor'
import HeatmapEditor from './components/editor/HeatmapEditor'
import BarChartEditor from './components/editor/BarChartEditor'
import LinePlotEditor from './components/editor/LinePlotEditor'
import ScatterEditor from './components/editor/ScatterEditor'
import HistogramEditor from './components/editor/HistogramEditor'
import FigurePreview from './components/preview/FigurePreview'
import FigureList from './components/common/FigureList'
import ComposeSettings from './components/compose/ComposeSettings'
import ComposeCanvas from './components/compose/ComposeCanvas'

// ------------------------------------------------------------------ defaults
const DEFAULT_CM: ConfusionMatrixState = {
  id: 'fig-1',
  type: 'confusion_matrix',
  data: [[45, 3], [2, 50]],
  params: {
    title: '', fontsize: 12, figsize_cm: [12, 10], dpi: 150,
    colormap: 'Blues', normalize: false, labels: ['Class 0', 'Class 1'],
    show_values: true, xlabel: 'Predicted Label', ylabel: 'True Label',
    xlabel_top: true, linewidths: 0.1, linecolor: 'black',
    annot_fontsize: 11, tick_fontsize: 11, cell_size_cm: null,
  },
}

const DEFAULT_HEATMAP: HeatmapState = {
  id: 'fig-1',
  type: 'heatmap',
  data: [[1.00, 0.80, 0.30], [0.80, 1.00, 0.50], [0.30, 0.50, 1.00]],
  params: {
    title: '', fontsize: 12, figsize_cm: [12, 10], dpi: 150,
    mode: 'heatmap', colormap: 'Blues',
    labels_x: ['A', 'B', 'C'], labels_y: ['A', 'B', 'C'],
    show_values: true, fmt: '.2f', vmin: null, vmax: null, mask_upper: false,
    xlabel: '', ylabel: '', linewidths: 0.5, linecolor: 'white',
    annot_fontsize: 10, tick_fontsize: 10, cell_size_cm: null,
  },
}

const DEFAULT_BAR: BarChartState = {
  id: 'fig-1',
  type: 'bar_chart',
  data: { labels: ['A', 'B', 'C', 'D'], values: [4.2, 7.8, 3.1, 6.5] },
  params: {
    title: '', fontsize: 12, figsize_cm: [14, 10], dpi: 150,
    xlabel: '', ylabel: '', colors: ['#6C63FF', '#FF6584', '#43CFAA', '#FFB347', '#5BC0EB', '#C879FF'],
    orientation: 'vertical', legend: [], show_values: false, tick_fontsize: 10,
    bar_width: 0.8, show_grid: false, grid_linestyle: '--',
    legend_loc: 'best', xlim: null, ylim: null, xtick_step: null, ytick_step: null,
    threshold_line: null, threshold_line_color: '#EF4444', threshold_line_style: '--',
    bar_colors: null, merge_threshold: null, merge_dir: 'below', merge_label: 'その他',
  },
}

const DEFAULT_LINE: LinePlotState = {
  id: 'fig-1',
  type: 'line_plot',
  data: { x: [0, 1, 2, 3, 4, 5], y: [0.1, 0.4, 0.9, 1.6, 2.5, 3.6] },
  params: {
    title: '', fontsize: 12, figsize_cm: [14, 10], dpi: 150,
    xlabel: '', ylabel: '',
    colors: ['#6C63FF', '#FF6584', '#43CFAA', '#FFB347', '#5BC0EB', '#C879FF'],
    legend: [], markers: ['o', 's', '^', 'D', 'v', 'P'],
    linewidth: 1.5, tick_fontsize: 10,
    show_grid: false, grid_linestyle: '--',
    legend_loc: 'best', xlim: null, ylim: null, xtick_step: null, ytick_step: null,
    log_scale_x: false, log_scale_y: false,
  },
}

const DEFAULT_SCATTER: ScatterState = {
  id: 'fig-1',
  type: 'scatter_plot',
  data: { x: [1,2,3,4,5,6,7,8], y: [1.2,2.5,2.8,4.1,4.9,6.2,6.8,8.3] },
  params: {
    title: '', fontsize: 12, figsize_cm: [12, 10], dpi: 150,
    xlabel: '', ylabel: '', color: '#6C63FF',
    marker_size: 40, alpha: 0.7, tick_fontsize: 10,
    show_grid: false, grid_linestyle: '--',
    xlim: null, ylim: null, xtick_step: null, ytick_step: null,
  },
}

const DEFAULT_HISTOGRAM: HistogramState = {
  id: 'fig-1',
  type: 'histogram',
  data: [2.1,2.5,2.8,3.0,3.2,3.3,3.5,3.7,3.8,4.0,4.1,4.2,4.4,4.5,4.6,4.8,5.0,5.1,5.3,5.5],
  params: {
    title: '', fontsize: 12, figsize_cm: [12, 10], dpi: 150,
    xlabel: '', ylabel: '', bins: 20, color: '#6C63FF',
    density: false, tick_fontsize: 10,
    show_grid: false, grid_linestyle: '--',
    ylim: null, ytick_step: null,
  },
}

const FIGURE_TYPES: { type: FigureType; label: string }[] = [
  { type: 'confusion_matrix', label: '混合行列' },
  { type: 'heatmap',          label: 'ヒートマップ' },
  { type: 'bar_chart',        label: '棒グラフ' },
  { type: 'line_plot',        label: '折れ線' },
  { type: 'scatter_plot',     label: '散布図' },
  { type: 'histogram',        label: 'ヒストグラム' },
]

const DEFAULT_BY_TYPE: Record<FigureType, typeof DEFAULT_CM> = {
  confusion_matrix: DEFAULT_CM,
  heatmap:          DEFAULT_HEATMAP,
  bar_chart:        DEFAULT_BAR as never,
  line_plot:        DEFAULT_LINE as never,
  scatter_plot:     DEFAULT_SCATTER as never,
  histogram:        DEFAULT_HISTOGRAM as never,
}

const genId = () => `fig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

type AppMode = 'edit' | 'compose'

// ------------------------------------------------------------------ App
export default function App() {
  const {
    figures, selectedId, layout, initialized,
    addFigure, updateFigure, removeFigure,
    setSelectedId, setLayout, reorderFigures, initialize,
  } = useFigureStore()

  const [appMode, setAppMode]     = useState<AppMode>('edit')
  const [previews, setPreviews]   = useState<Record<string, string>>({})
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const selectedFigure = figures.find((f) => f.id === selectedId) ?? figures[0] ?? null

  // ----------------------------------------------------- init
  useEffect(() => {
    initialize().then(() => {
      const { figures: figs } = useFigureStore.getState()
      if (!figs.length) {
        const fig = { ...DEFAULT_CM, id: 'fig-1' }
        addFigure(fig)
        setSelectedId(fig.id)
      }
    })
  }, [])

  // Restore previews from cache
  useEffect(() => {
    if (!initialized) return
    const cached: Record<string, string> = {}
    figures.forEach((f) => {
      const b64 = getPreview(f.id)
      if (b64) cached[f.id] = b64
    })
    if (Object.keys(cached).length) {
      setPreviews((prev) => ({ ...prev, ...cached }))
    }
  }, [initialized, figures.map((f) => f.id).join(',')])

  // ----------------------------------------------------- render on fig change
  useEffect(() => {
    if (!selectedFigure) return
    setLoading(true)
    setError(null)
    debouncedRender(
      selectedFigure,
      (b64) => {
        setPreviews((prev) => ({ ...prev, [selectedFigure.id]: b64 }))
        savePreview(selectedFigure.id, b64).catch(() => {})
        setLoading(false)
      },
      (msg) => { setError(msg); setLoading(false) },
    )
  }, [selectedFigure?.data, selectedFigure?.params])

  const prevSelectedId = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedFigure) return
    if (selectedFigure.id === prevSelectedId.current) return
    prevSelectedId.current = selectedFigure.id
    if (previews[selectedFigure.id]) return
    setLoading(true)
    setError(null)
    renderAndCache(selectedFigure)
      .then((b64) => {
        setPreviews((prev) => ({ ...prev, [selectedFigure.id]: b64 }))
        savePreview(selectedFigure.id, b64).catch(() => {})
        setError(null)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedFigure?.id])

  useEffect(() => {
    if (appMode !== 'compose') return
    figures.forEach((fig) => {
      if (previews[fig.id]) return
      renderAndCache(fig)
        .then((b64) => {
          setPreviews((prev) => ({ ...prev, [fig.id]: b64 }))
          savePreview(fig.id, b64).catch(() => {})
        })
        .catch(() => {})
    })
  }, [appMode])

  // ----------------------------------------------------- figure management
  const handleAddFigure = useCallback((type: FigureType) => {
    const fig = { ...DEFAULT_BY_TYPE[type], id: genId() }
    addFigure(fig)
    setSelectedId(fig.id)
  }, [addFigure, setSelectedId])

  const handleDeleteFigure = useCallback((id: string) => {
    removeFigure(id)
  }, [removeFigure])

  const handleDuplicateFigure = useCallback((id: string) => {
    const fig = figures.find((f) => f.id === id)
    if (!fig) return
    const newFig = { ...fig, id: genId() }
    addFigure(newFig)
    setSelectedId(newFig.id)
  }, [figures, addFigure, setSelectedId])

  // ----------------------------------------------------- type switch
  const handleTypeSwitch = useCallback((type: FigureType) => {
    if (!selectedFigure || selectedFigure.type === type) return
    updateFigure(selectedFigure.id, () => ({ ...DEFAULT_BY_TYPE[type], id: selectedFigure.id }))
    setPreviews((prev) => { const n = { ...prev }; delete n[selectedFigure.id]; return n })
  }, [selectedFigure, updateFigure])

  // ----------------------------------------------------- generic param handler factory
  const makeParamsHandler = <T,>(type: FigureType) =>
    useCallback((patch: Partial<T>) => {
      if (!selectedFigure || selectedFigure.type !== type) return
      updateFigure(selectedFigure.id, (f) => ({
        ...f, params: { ...(f as { params: T }).params, ...patch },
      }))
    }, [selectedFigure, updateFigure])

  const handleCMParamsChange     = makeParamsHandler<ConfusionMatrixParams>('confusion_matrix')
  const handleHMParamsChange     = makeParamsHandler<HeatmapParams>('heatmap')
  const handleBarParamsChange    = makeParamsHandler<BarChartParams>('bar_chart')
  const handleLineParamsChange   = makeParamsHandler<LinePlotParams>('line_plot')
  const handleScatterParamsChange = makeParamsHandler<ScatterParams>('scatter_plot')
  const handleHistParamsChange   = makeParamsHandler<HistogramParams>('histogram')

  // ----------------------------------------------------- data handlers
  const handleCMDataChange = useCallback((data: number[][]) => {
    if (!selectedFigure || selectedFigure.type !== 'confusion_matrix') return
    const fig = selectedFigure as ConfusionMatrixState
    const newLabels = Array.from({ length: data.length }, (_, i) => fig.params.labels[i] ?? `Class ${i}`)
    updateFigure(fig.id, (f) => ({
      ...f, data,
      params: { ...(f as ConfusionMatrixState).params, labels: newLabels },
    } as ConfusionMatrixState))
  }, [selectedFigure, updateFigure])

  const handleHMDataChange = useCallback((
    data: number[][], extractedLabels?: { x: string[], y: string[] },
  ) => {
    if (!selectedFigure || selectedFigure.type !== 'heatmap') return
    const fig = selectedFigure as HeatmapState
    const labelsX = extractedLabels?.x ?? Array.from({ length: data[0]?.length ?? 0 }, (_, i) => fig.params.labels_x[i] ?? `Col ${i}`)
    const labelsY = extractedLabels?.y ?? Array.from({ length: data.length }, (_, i) => fig.params.labels_y[i] ?? `Row ${i}`)
    updateFigure(fig.id, (f) => ({
      ...f, data,
      params: { ...(f as HeatmapState).params, labels_x: labelsX, labels_y: labelsY },
    } as HeatmapState))
  }, [selectedFigure, updateFigure])

  const handleBarDataChange = useCallback((data: BarChartState['data'], seriesLabels?: string[]) => {
    if (!selectedFigure || selectedFigure.type !== 'bar_chart') return
    updateFigure(selectedFigure.id, (f) => {
      const next = { ...f, data } as BarChartState
      if (seriesLabels) next.params = { ...next.params, legend: seriesLabels }
      return next
    })
  }, [selectedFigure, updateFigure])

  const handleLineDataChange = useCallback((data: LinePlotState['data'], seriesLabels?: string[]) => {
    if (!selectedFigure || selectedFigure.type !== 'line_plot') return
    updateFigure(selectedFigure.id, (f) => {
      const next = { ...f, data } as LinePlotState
      if (seriesLabels) next.params = { ...next.params, legend: seriesLabels }
      return next
    })
  }, [selectedFigure, updateFigure])

  const handleScatterDataChange = useCallback((data: ScatterState['data']) => {
    if (!selectedFigure || selectedFigure.type !== 'scatter_plot') return
    updateFigure(selectedFigure.id, (f) => ({ ...f, data } as ScatterState))
  }, [selectedFigure, updateFigure])

  const handleHistDataChange = useCallback((data: number[]) => {
    if (!selectedFigure || selectedFigure.type !== 'histogram') return
    updateFigure(selectedFigure.id, (f) => ({ ...f, data } as HistogramState))
  }, [selectedFigure, updateFigure])

  // ----------------------------------------------------- reset handlers
  const makeReset = (def: typeof DEFAULT_CM) =>
    useCallback(() => {
      if (!selectedFigure) return
      updateFigure(selectedFigure.id, (f) => ({ ...f, params: def.params }))
    }, [selectedFigure, updateFigure])

  const handleCMReset      = makeReset(DEFAULT_CM)
  const handleHMReset      = makeReset(DEFAULT_HEATMAP as never)
  const handleBarReset     = makeReset(DEFAULT_BAR as never)
  const handleLineReset    = makeReset(DEFAULT_LINE as never)
  const handleScatterReset = makeReset(DEFAULT_SCATTER as never)
  const handleHistReset    = makeReset(DEFAULT_HISTOGRAM as never)

  // ----------------------------------------------------- download
  const handleDownload = () => {
    if (!selectedFigure) return
    const b64 = previews[selectedFigure.id]
    if (!b64) return
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${b64}`
    a.download = `${selectedFigure.params.title || 'figure'}.png`
    a.click()
  }

  // ----------------------------------------------------- compose export
  const handleComposeExport = async () => {
    if (figures.length === 0) return
    setExporting(true)
    try {
      const b64 = await composeAndExport(figures, layout)
      const a = document.createElement('a')
      a.href = `data:image/png;base64,${b64}`
      a.download = 'compose.png'
      a.click()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setExporting(false)
    }
  }

  // ----------------------------------------------------- loading state
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: '#6C63FF' }} />
          <span className="text-sm text-gray-400">読み込み中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <header
        className="bg-white border-b border-gray-200 px-4 flex items-center gap-3"
        style={{ boxShadow: 'var(--shadow-sm)', height: 52 }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity=".9"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity=".6"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity=".6"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity=".9"/>
            </svg>
          </div>
          <h1 className="text-sm font-bold text-gray-800 leading-none whitespace-nowrap">Figure Modification</h1>
        </div>

        <div className="w-px self-stretch bg-gray-200 mx-1 shrink-0" />

        <FigureList
          figures={figures}
          selectedId={selectedFigure?.id ?? null}
          onSelect={setSelectedId}
          onDelete={handleDeleteFigure}
          onAdd={handleAddFigure}
          onDuplicate={handleDuplicateFigure}
        />

        <div className="w-px self-stretch bg-gray-200 mx-1 shrink-0" />

        <div className="flex rounded-xl overflow-hidden shrink-0" style={{ border: '1px solid #E5E7EB', boxShadow: 'var(--shadow-sm)' }}>
          {(['edit', 'compose'] as AppMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setAppMode(mode)}
              className="px-5 py-2 text-sm font-bold transition-all"
              style={{
                background: appMode === mode ? '#6C63FF' : 'white',
                color: appMode === mode ? 'white' : '#6B7280',
                minWidth: 72,
              }}
            >
              {mode === 'edit' ? '編集' : '構成'}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* 左パネル */}
        <div
          className="w-80 flex-shrink-0 bg-white flex flex-col"
          style={{ borderRight: '1px solid #E5E7EB', boxShadow: '2px 0 8px rgba(0,0,0,.04)', overflow: 'hidden' }}
        >
          {appMode === 'edit' ? (
            <>
              {selectedFigure && (
                <>
                  {/* 図種タブ（固定） */}
                  <div className="bg-white flex-shrink-0" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      {FIGURE_TYPES.map((t) => (
                        <button
                          key={t.type}
                          onClick={() => handleTypeSwitch(t.type)}
                          className="px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0"
                          style={{
                            borderBottomColor: selectedFigure.type === t.type ? '#6C63FF' : 'transparent',
                            color: selectedFigure.type === t.type ? '#6C63FF' : '#6B7280',
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* スクロール可能エリア */}
                  <div className="flex-1 overflow-y-auto">
                    <section className="p-4 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">データ入力</p>
                      {selectedFigure.type === 'confusion_matrix' && (
                        <CreateMode data={selectedFigure.data} onDataChange={handleCMDataChange} />
                      )}
                      {selectedFigure.type === 'heatmap' && (
                        <HeatmapCreateMode data={selectedFigure.data} onDataChange={handleHMDataChange} />
                      )}
                      {selectedFigure.type === 'bar_chart' && (
                        <BarChartInput data={(selectedFigure as BarChartState).data} onChange={handleBarDataChange} />
                      )}
                      {selectedFigure.type === 'line_plot' && (
                        <LinePlotInput data={(selectedFigure as LinePlotState).data} onChange={handleLineDataChange} />
                      )}
                      {selectedFigure.type === 'scatter_plot' && (
                        <ScatterInput data={(selectedFigure as ScatterState).data} onChange={handleScatterDataChange} />
                      )}
                      {selectedFigure.type === 'histogram' && (
                        <HistogramInput data={(selectedFigure as HistogramState).data} onChange={handleHistDataChange} />
                      )}
                    </section>

                    <section className="p-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">パラメータ</p>
                      {selectedFigure.type === 'confusion_matrix' && (
                        <FigureEditor figure={selectedFigure as ConfusionMatrixState} onChange={handleCMParamsChange} onReset={handleCMReset} />
                      )}
                      {selectedFigure.type === 'heatmap' && (
                        <HeatmapEditor figure={selectedFigure as HeatmapState} onChange={handleHMParamsChange} onReset={handleHMReset} />
                      )}
                      {selectedFigure.type === 'bar_chart' && (
                        <BarChartEditor figure={selectedFigure as BarChartState} onChange={handleBarParamsChange} onReset={handleBarReset} />
                      )}
                      {selectedFigure.type === 'line_plot' && (
                        <LinePlotEditor figure={selectedFigure as LinePlotState} onChange={handleLineParamsChange} onReset={handleLineReset} />
                      )}
                      {selectedFigure.type === 'scatter_plot' && (
                        <ScatterEditor figure={selectedFigure as ScatterState} onChange={handleScatterParamsChange} onReset={handleScatterReset} />
                      )}
                      {selectedFigure.type === 'histogram' && (
                        <HistogramEditor figure={selectedFigure as HistogramState} onChange={handleHistParamsChange} onReset={handleHistReset} />
                      )}
                    </section>
                  </div>
                </>
              )}
            </>
          ) : (
            <section className="p-4 flex-1 overflow-y-auto">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">構成設定</p>
              <ComposeSettings
                figures={figures}
                layout={layout}
                onLayoutChange={setLayout}
                onReorder={reorderFigures}
                onExport={handleComposeExport}
                exporting={exporting}
              />
            </section>
          )}
        </div>

        {/* 右パネル */}
        <div className="flex-1 p-6 flex flex-col overflow-auto">
          {appMode === 'edit' ? (
            <FigurePreview
              b64={selectedFigure ? (previews[selectedFigure.id] ?? null) : null}
              loading={loading}
              error={error}
              onDownload={handleDownload}
            />
          ) : (
            <ComposeCanvas figures={figures} layout={layout} previews={previews} />
          )}
        </div>
      </main>
    </div>
  )
}

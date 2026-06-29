import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  FigureType,
  ConfusionMatrixParams,
  ConfusionMatrixState,
  HeatmapParams,
  HeatmapState,
} from './types/figures'
import { useFigureStore } from './store/figureStore'
import { getPreview } from './cache/previewCache'
import { savePreview } from './storage/db'
import { debouncedRender, renderAndCache, composeAndExport } from './api/figureApi'
import CreateMode from './components/input/CreateMode'
import HeatmapCreateMode from './components/input/HeatmapCreateMode'
import FigureEditor from './components/editor/FigureEditor'
import HeatmapEditor from './components/editor/HeatmapEditor'
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
  data: [[1.00, 0.80, 0.30], [0.80, 1.00, 0.50], [0.30, 0.50, 1.00]],
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

const FIGURE_TYPES: { type: FigureType; label: string }[] = [
  { type: 'confusion_matrix', label: '混合行列' },
  { type: 'heatmap',          label: 'ヒートマップ' },
]

const genId = () => `fig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

type AppMode = 'edit' | 'compose'

// ------------------------------------------------------------------ App
export default function App() {
  const {
    figures, selectedId, layout, initialized,
    addFigure, updateFigure, removeFigure,
    setSelectedId, setLayout, reorderFigures, initialize,
  } = useFigureStore()

  const [appMode, setAppMode]       = useState<AppMode>('edit')
  const [previews, setPreviews]     = useState<Record<string, string>>({})
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [exporting, setExporting]   = useState(false)

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

  // Restore previews from cache on figure list changes
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

  // Render on figure switch (if no cached preview)
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

  // Render non-previewed figures when switching to compose mode
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
    const template = type === 'confusion_matrix' ? DEFAULT_CM : DEFAULT_HEATMAP
    const fig = { ...template, id: genId() }
    addFigure(fig)
    setSelectedId(fig.id)
  }, [addFigure, setSelectedId])

  const handleDeleteFigure = useCallback((id: string) => {
    removeFigure(id)
  }, [removeFigure])

  // ----------------------------------------------------- type switch (for selected)
  const handleTypeSwitch = useCallback((type: FigureType) => {
    if (!selectedFigure || selectedFigure.type === type) return
    const template = type === 'confusion_matrix' ? DEFAULT_CM : DEFAULT_HEATMAP
    updateFigure(selectedFigure.id, () => ({ ...template, id: selectedFigure.id }))
    setPreviews((prev) => { const n = { ...prev }; delete n[selectedFigure.id]; return n })
  }, [selectedFigure, updateFigure])

  // ----------------------------------------------------- CM handlers
  const handleCMDataChange = useCallback((data: number[][]) => {
    if (!selectedFigure || selectedFigure.type !== 'confusion_matrix') return
    const fig = selectedFigure as ConfusionMatrixState
    const newN = data.length
    const oldN = fig.data.length
    if (newN !== oldN) {
      const newLabels = Array.from({ length: newN }, (_, i) => fig.params.labels[i] ?? `Class ${i}`)
      updateFigure(fig.id, (f) => ({
        ...f, data,
        params: { ...(f as ConfusionMatrixState).params, labels: newLabels },
      } as ConfusionMatrixState))
    } else {
      updateFigure(fig.id, (f) => ({ ...f, data } as ConfusionMatrixState))
    }
  }, [selectedFigure, updateFigure])

  const handleCMParamsChange = useCallback((patch: Partial<ConfusionMatrixParams>) => {
    if (!selectedFigure || selectedFigure.type !== 'confusion_matrix') return
    updateFigure(selectedFigure.id, (f) => ({
      ...f, params: { ...(f as ConfusionMatrixState).params, ...patch },
    } as ConfusionMatrixState))
  }, [selectedFigure, updateFigure])

  const handleCMReset = useCallback(() => {
    if (!selectedFigure || selectedFigure.type !== 'confusion_matrix') return
    updateFigure(selectedFigure.id, (f) => ({ ...f, params: DEFAULT_CM.params } as ConfusionMatrixState))
  }, [selectedFigure, updateFigure])

  // ----------------------------------------------------- HM handlers
  const handleHMDataChange = useCallback((
    data: number[][], extractedLabels?: { x: string[], y: string[] },
  ) => {
    if (!selectedFigure || selectedFigure.type !== 'heatmap') return
    const fig = selectedFigure as HeatmapState
    const newRows = data.length
    const newCols = data[0]?.length ?? 0
    const labelsX = extractedLabels?.x ??
      Array.from({ length: newCols }, (_, i) => fig.params.labels_x[i] ?? `Col ${i}`)
    const labelsY = extractedLabels?.y ??
      Array.from({ length: newRows }, (_, i) => fig.params.labels_y[i] ?? `Row ${i}`)
    updateFigure(fig.id, (f) => ({
      ...f, data,
      params: { ...(f as HeatmapState).params, labels_x: labelsX, labels_y: labelsY },
    } as HeatmapState))
  }, [selectedFigure, updateFigure])

  const handleHMParamsChange = useCallback((patch: Partial<HeatmapParams>) => {
    if (!selectedFigure || selectedFigure.type !== 'heatmap') return
    updateFigure(selectedFigure.id, (f) => ({
      ...f, params: { ...(f as HeatmapState).params, ...patch },
    } as HeatmapState))
  }, [selectedFigure, updateFigure])

  const handleHMReset = useCallback(() => {
    if (!selectedFigure || selectedFigure.type !== 'heatmap') return
    updateFigure(selectedFigure.id, (f) => ({ ...f, params: DEFAULT_HEATMAP.params } as HeatmapState))
  }, [selectedFigure, updateFigure])

  // ----------------------------------------------------- download (single)
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
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin"
            style={{ borderTopColor: '#6C63FF' }}
          />
          <span className="text-sm text-gray-400">読み込み中...</span>
        </div>
      </div>
    )
  }

  const subtitle = appMode === 'compose'
    ? '構成モード'
    : selectedFigure?.type === 'heatmap' ? 'ヒートマップエディタ' : '混合行列エディタ'

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
        <div className="flex-1">
          <h1 className="text-sm font-bold text-gray-800 leading-none">Figure Modification</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Mode toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid #E5E7EB', boxShadow: 'var(--shadow-sm)' }}
        >
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
              {/* 図リスト（固定） */}
              <FigureList
                figures={figures}
                selectedId={selectedFigure?.id ?? null}
                onSelect={setSelectedId}
                onDelete={handleDeleteFigure}
                onAdd={handleAddFigure}
              />

              {selectedFigure && (
                <>
                  {/* 図種タブ（固定） */}
                  <div className="flex border-b border-gray-200 px-3 pt-3 bg-white flex-shrink-0">
                    {FIGURE_TYPES.map((t) => (
                      <button
                        key={t.type}
                        onClick={() => handleTypeSwitch(t.type)}
                        className="flex-1 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors"
                        style={{
                          borderBottomColor: selectedFigure.type === t.type ? '#6C63FF' : 'transparent',
                          color: selectedFigure.type === t.type ? '#6C63FF' : '#6B7280',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* スクロール可能な内容エリア */}
                  <div className="flex-1 overflow-y-auto">
                    <section className="p-4 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        データ入力
                      </p>
                      {selectedFigure.type === 'confusion_matrix' ? (
                        <CreateMode data={selectedFigure.data} onDataChange={handleCMDataChange} />
                      ) : (
                        <HeatmapCreateMode data={selectedFigure.data} onDataChange={handleHMDataChange} />
                      )}
                    </section>

                    <section className="p-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        パラメータ
                      </p>
                      {selectedFigure.type === 'confusion_matrix' ? (
                        <FigureEditor
                          figure={selectedFigure as ConfusionMatrixState}
                          onChange={handleCMParamsChange}
                          onReset={handleCMReset}
                        />
                      ) : (
                        <HeatmapEditor
                          figure={selectedFigure as HeatmapState}
                          onChange={handleHMParamsChange}
                          onReset={handleHMReset}
                        />
                      )}
                    </section>
                  </div>
                </>
              )}
            </>
          ) : (
            /* 構成モード: 設定パネル */
            <section className="p-4 flex-1 overflow-y-auto">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                構成設定
              </p>
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
            <ComposeCanvas
              figures={figures}
              layout={layout}
              previews={previews}
            />
          )}
        </div>
      </main>
    </div>
  )
}

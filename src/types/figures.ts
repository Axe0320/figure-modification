export type FigureType = 'confusion_matrix' | 'heatmap'
export type OutputFormat = 'png' | 'svg' | 'pdf' | 'eps'

interface BaseFigureState {
  id: string
  type: FigureType
}

export interface BaseFigureParams {
  title: string
  fontsize: number
  figsize_cm: [number, number]
  dpi: number
}

export interface ConfusionMatrixParams extends BaseFigureParams {
  colormap: string
  normalize: boolean
  labels: string[]
  show_values: boolean
  xlabel: string
  ylabel: string
  xlabel_top: boolean
  linewidths: number
  linecolor: string
  annot_fontsize: number
  tick_fontsize: number
  cell_size_cm: number | null
}

export type ConfusionMatrixState = BaseFigureState & {
  type: 'confusion_matrix'
  data: number[][]
  params: ConfusionMatrixParams
}

export interface HeatmapParams extends BaseFigureParams {
  mode: 'heatmap' | 'correlation'
  colormap: string
  labels_x: string[]
  labels_y: string[]
  show_values: boolean
  fmt: string
  vmin: number | null
  vmax: number | null
  mask_upper: boolean
  xlabel: string
  ylabel: string
  linewidths: number
  linecolor: string
  annot_fontsize: number
  tick_fontsize: number
  cell_size_cm: number | null
}

export type HeatmapState = BaseFigureState & {
  type: 'heatmap'
  data: number[][]
  params: HeatmapParams
}

export type FigureState = ConfusionMatrixState | HeatmapState

// ------------------------------------------------------------------ compose

export interface FigurePosition {
  figureId: string
  x: number   // free layout: px from canvas origin
  y: number
  w: number   // 0 = auto
  h: number
}

export interface ComposeLayout {
  mode: 'grid' | 'free'
  gridCols: number
  gridRows: number   // 0 = auto (ceil(n/cols))
  gap: number        // cm
  positions: FigurePosition[]
}

export const DEFAULT_COMPOSE_LAYOUT: ComposeLayout = {
  mode: 'grid',
  gridCols: 2,
  gridRows: 0,
  gap: 0.5,
  positions: [],
}

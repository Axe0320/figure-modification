export type FigureType =
  | 'confusion_matrix'
  | 'heatmap'
  | 'bar_chart'
  | 'line_plot'
  | 'scatter_plot'
  | 'histogram'

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

// ------------------------------------------------------------------ Phase 1
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

// ------------------------------------------------------------------ Phase 2
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

// ------------------------------------------------------------------ Phase 4

// bar_chart
// data.values: number[] = single series, number[][] = grouped (outer=series, inner=category)
export type BarChartData = { labels: string[]; values: number[] | number[][] }

export interface BarChartParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  colors: string[]
  orientation: 'vertical' | 'horizontal'
  legend: string[]
  tick_fontsize: number
  show_values: boolean
  bar_width: number
  show_grid: boolean
  grid_linestyle: string
  legend_loc: string
  xlim: [number, number] | null
  ylim: [number, number] | null
  xtick_step: number | null
  ytick_step: number | null
  // threshold features
  threshold_line: number | null
  threshold_line_color: string
  threshold_line_style: string
  bar_colors: string[] | null
  merge_threshold: number | null
  merge_dir: 'below' | 'above'
  merge_label: string
}

export type BarChartState = BaseFigureState & {
  type: 'bar_chart'
  data: BarChartData
  params: BarChartParams
}

// line_plot
// data.y: number[] = single series, number[][] = multiple (outer=series, inner=x-point)
export type LinePlotData = { x: number[]; y: number[] | number[][] }

export interface LinePlotParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  colors: string[]
  legend: string[]
  markers: string[]
  linewidth: number
  tick_fontsize: number
  show_grid: boolean
  grid_linestyle: string
  legend_loc: string
  xlim: [number, number] | null
  ylim: [number, number] | null
  xtick_step: number | null
  ytick_step: number | null
  log_scale_x: boolean
  log_scale_y: boolean
}

export type LinePlotState = BaseFigureState & {
  type: 'line_plot'
  data: LinePlotData
  params: LinePlotParams
}

// scatter_plot
export type ScatterData = { x: number[]; y: number[] }

export interface ScatterParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  color: string
  marker_size: number
  alpha: number
  tick_fontsize: number
  show_grid: boolean
  grid_linestyle: string
  xlim: [number, number] | null
  ylim: [number, number] | null
  xtick_step: number | null
  ytick_step: number | null
}

export type ScatterState = BaseFigureState & {
  type: 'scatter_plot'
  data: ScatterData
  params: ScatterParams
}

// histogram
export interface HistogramParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  bins: number
  color: string
  density: boolean
  tick_fontsize: number
  show_grid: boolean
  grid_linestyle: string
  ylim: [number, number] | null
  ytick_step: number | null
}

export type HistogramState = BaseFigureState & {
  type: 'histogram'
  data: number[]
  params: HistogramParams
}

// ------------------------------------------------------------------ union
export type FigureState =
  | ConfusionMatrixState
  | HeatmapState
  | BarChartState
  | LinePlotState
  | ScatterState
  | HistogramState

// ------------------------------------------------------------------ compose

export interface FigurePosition {
  figureId: string
  x: number
  y: number
  w: number
  h: number
}

export interface ComposeLayout {
  mode: 'grid' | 'free'
  gridCols: number
  gridRows: number
  gap: number
  positions: FigurePosition[]
}

export const DEFAULT_COMPOSE_LAYOUT: ComposeLayout = {
  mode: 'grid',
  gridCols: 2,
  gridRows: 0,
  gap: 0.5,
  positions: [],
}

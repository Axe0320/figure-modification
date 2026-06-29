export type FigureType = 'confusion_matrix'
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
}

export type ConfusionMatrixState = BaseFigureState & {
  type: 'confusion_matrix'
  data: number[][]
  params: ConfusionMatrixParams
}

export type FigureState = ConfusionMatrixState

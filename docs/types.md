# TypeScript 型定義

## 基本構造

```typescript
// src/types/figures.ts

// id を FigureState に最初から含める
interface BaseFigureState {
  id: string
  type: FigureType
}

// 全図種共通パラメータ
interface BaseFigureParams {
  title: string
  fontsize: number
  figsize_cm: [number, number]    // cm単位（ジャーナル指定対応）
  dpi: number
}

// 出力形式はリクエスト時に別途渡す（params には含めない）
type OutputFormat = 'png' | 'svg' | 'pdf' | 'eps'
```

---

## 図種ごとのパラメータ型

```typescript
// 混合行列（Phase 1）
interface ConfusionMatrixParams extends BaseFigureParams {
  colormap: string
  normalize: boolean
  labels: string[]
  show_values: boolean
}

// ヒートマップ・相関行列（Phase 2）
interface HeatmapParams extends BaseFigureParams {
  colormap: string
  labels_x: string[]
  labels_y: string[]
  show_values: boolean
  fmt: string
}

// 棒グラフ（Phase 4）
interface BarChartParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  colors: string[]
  orientation: 'vertical' | 'horizontal'
  legend: string[]
}

// 折れ線グラフ（Phase 4）
interface LinePlotParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  colors: string[]
  legend: string[]
  markers: string[]
}

// 散布図（Phase 4）
interface ScatterParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  colors: string[]
  legend: string[]
  marker_size: number
}

// ヒストグラム（Phase 4）
interface HistogramParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  bins: number
  color: string
  density: boolean
}

// ROC曲線（Phase 5）
interface RocParams extends BaseFigureParams {
  labels: string[]
  colors: string[]
  show_diagonal: boolean
}

// Precision-Recall曲線（Phase 5）
interface PrParams extends BaseFigureParams {
  labels: string[]
  colors: string[]
}

// 学習曲線（Phase 5）
interface LearningParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  train_label: string
  val_label: string
  colors: [string, string]
}

// 特徴量重要度（Phase 5）
interface FeatureParams extends BaseFigureParams {
  xlabel: string
  color: string
  top_n: number
}

// 箱ひげ図（Phase 7）
interface BoxParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  labels: string[]
  colors: string[]
}

// バイオリン図（Phase 7）
interface ViolinParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  labels: string[]
  colors: string[]
}

// エラーバー付き棒グラフ（Phase 7）
interface ErrorBarParams extends BaseFigureParams {
  xlabel: string
  ylabel: string
  labels: string[]
  colors: string[]
}
```

---

## FigureState（discriminated union）

```typescript
type FigureState =
  | (BaseFigureState & { type: 'confusion_matrix'; data: number[][];    params: ConfusionMatrixParams })
  | (BaseFigureState & { type: 'heatmap';          data: number[][];    params: HeatmapParams })
  | (BaseFigureState & { type: 'bar_chart';        data: BarChartData;  params: BarChartParams })
  | (BaseFigureState & { type: 'line_plot';        data: LinePlotData;  params: LinePlotParams })
  | (BaseFigureState & { type: 'scatter_plot';     data: ScatterData;   params: ScatterParams })
  | (BaseFigureState & { type: 'histogram';        data: number[];      params: HistogramParams })
  | (BaseFigureState & { type: 'roc_curve';        data: RocData;       params: RocParams })
  | (BaseFigureState & { type: 'pr_curve';         data: PrData;        params: PrParams })
  | (BaseFigureState & { type: 'learning_curve';   data: LearningData;  params: LearningParams })
  | (BaseFigureState & { type: 'feature_importance'; data: FeatureData; params: FeatureParams })
  | (BaseFigureState & { type: 'box_plot';         data: BoxData;       params: BoxParams })
  | (BaseFigureState & { type: 'violin_plot';      data: ViolinData;    params: ViolinParams })
  | (BaseFigureState & { type: 'error_bar';        data: ErrorBarData;  params: ErrorBarParams })
```

---

## Compose レイアウト

```typescript
interface ComposeLayout {
  mode: 'grid' | 'free'
  grid?: { rows: number; cols: number }
  figures: {
    id: string
    x?: number
    y?: number
    width?: number
    height?: number
  }[]
}
```

---

## データ型

各図種の `data` に使う型。実装時に詳細化する。

```typescript
type BarChartData    = { labels: string[]; values: number[] | number[][] }
type LinePlotData    = { x: number[]; y: number[] | number[][] }
type ScatterData     = { x: number[]; y: number[] }
type RocData         = { fpr: number[][]; tpr: number[][]; auc: number[] }
type PrData          = { precision: number[][]; recall: number[][]; ap: number[] }
type LearningData    = { epochs: number[]; train: number[]; val: number[] }
type FeatureData     = { features: string[]; importances: number[] }
type BoxData         = { groups: number[][] }
type ViolinData      = { groups: number[][] }
type ErrorBarData    = { labels: string[]; means: number[]; errors: number[] }
```

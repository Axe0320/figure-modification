import { debounce } from 'lodash-es'
import * as Sentry from '@sentry/react'
import { setPreview } from '../cache/previewCache'
import type { FigureState, ComposeLayout, OutputFormat } from '../types/figures'

const postRender = async (fig: FigureState, format: OutputFormat): Promise<string> => {
  const res = await fetch('/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: fig.type, data: fig.data, params: fig.params, output: { format } }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  const { image } = await res.json()
  return image
}

export const validate = (fig: FigureState): string | null => {
  switch (fig.type) {
    case 'confusion_matrix':
      if (!fig.data.length) return 'データを入力してください'
      if (fig.data.some((row) => row.length !== fig.data.length))
        return '正方行列を入力してください'
      break
    case 'heatmap':
      if (!fig.data.length) return 'データを入力してください'
      if (fig.data.some((row) => row.length !== (fig.data[0]?.length ?? 0)))
        return '各行の長さが異なります'
      break
  }
  return null
}

export const renderAndCache = async (
  fig: FigureState,
  format: OutputFormat = 'png',
): Promise<string> => {
  const err = validate(fig)
  if (err) throw new Error(err)
  const b64 = await postRender(fig, format)
  setPreview(fig.id, b64)
  return b64
}

export const debouncedRender = debounce(
  async (
    fig: FigureState,
    onSuccess: (b64: string) => void,
    onError: (msg: string) => void,
  ) => {
    try {
      const b64 = await renderAndCache(fig)
      onSuccess(b64)
    } catch (e) {
      Sentry.captureException(e)
      onError(e instanceof Error ? e.message : String(e))
    }
  },
  400,
)

export const composeAndExport = async (
  figures: FigureState[],
  layout: ComposeLayout,
  format: OutputFormat = 'png',
): Promise<string> => {
  const dpi = figures[0]?.params.dpi ?? 150
  const res = await fetch('/api/compose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      figures: figures.map((f) => ({ type: f.type, data: f.data, params: f.params })),
      layout: { gridCols: layout.gridCols, gap: layout.gap },
      output: { format, dpi },
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  const { image } = await res.json()
  return image
}

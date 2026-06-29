import { useState, useCallback } from 'react'
import type { FigureType } from '../types/figures'
import { runOcr, type OcrProvider } from '../api/ocrApi'

export type { OcrProvider }

export type OcrStatus = 'idle' | 'processing' | 'done' | 'error'

export interface OcrState {
  status: OcrStatus
  extracted: Record<string, unknown> | null
  error: string | null
}

const PROVIDER_KEY: Record<OcrProvider, string> = {
  claude: 'ocr_anthropic_key',
  openai: 'ocr_openai_key',
  gemini: 'ocr_google_key',
}

export function useOcr() {
  const [state, setState] = useState<OcrState>({ status: 'idle', extracted: null, error: null })

  const run = useCallback(async (imageB64: string, type: FigureType, provider: OcrProvider) => {
    const apiKey = localStorage.getItem(PROVIDER_KEY[provider]) ?? ''
    if (!apiKey) {
      setState({ status: 'error', extracted: null, error: `${provider} のAPIキーが未設定です。⚙️ から設定してください。` })
      return
    }
    setState({ status: 'processing', extracted: null, error: null })
    try {
      const result = await runOcr(imageB64, type, provider, apiKey)
      setState({ status: 'done', extracted: result.extracted, error: null })
    } catch (e) {
      setState({
        status: 'error',
        extracted: null,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }, [])

  const reset = useCallback(() => setState({ status: 'idle', extracted: null, error: null }), [])

  return { ...state, run, reset }
}

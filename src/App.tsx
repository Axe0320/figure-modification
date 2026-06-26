import { useState } from 'react'
import * as Sentry from '@sentry/react'
import styles from './App.module.css'

interface RenderResult {
  image?: string
  error?: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const [status, setStatus]   = useState<Status>('idle')
  const [image, setImage]     = useState<string | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const generate = async () => {
    setStatus('loading')
    setImage(null)
    setError(null)

    const start = performance.now()

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'confusion_matrix',
          data: [[45, 3], [2, 50]],
          params: {
            title: 'Phase 0 — Confusion Matrix',
            fontsize: 12,
            figsize_cm: [12, 10],
            dpi: 150,
            colormap: 'Blues',
            normalize: false,
            labels: ['Cat', 'Dog'],
            show_values: true,
          },
          output: { format: 'png' },
        }),
      })

      setElapsed(Math.round(performance.now() - start))

      const data: RenderResult = await res.json()

      if (!res.ok || data.error) {
        const msg = data.error ?? `HTTP ${res.status}`
        Sentry.captureException(new Error(`render API: ${msg}`))
        setError(msg)
        setStatus('error')
        return
      }

      setImage(data.image ?? null)
      setStatus('success')
    } catch (e) {
      setElapsed(Math.round(performance.now() - start))
      Sentry.captureException(e)
      setError(String(e))
      setStatus('error')
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Figure Modification</h1>
        <p>Phase 0 — Vercel Functions + matplotlib 動作確認</p>
      </header>

      <section className={styles.card}>
        <h2>混合行列の生成テスト</h2>
        <p className={styles.description}>
          ボタンを押すと <code>/api/render</code> を叩き、
          matplotlib で生成した PNG を返します。
          初回リクエストはコールドスタートにより数秒かかる場合があります。
        </p>

        <button
          className={styles.button}
          onClick={generate}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '生成中...' : '生成'}
        </button>

        <button
          className={styles.button}
          style={{ marginLeft: '8px', background: '#e53e3e' }}
          onClick={async () => {
            const res = await fetch('/api/render', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'confusion_matrix', data: [[1,2],[3,4]], params: { figsize_cm: 'invalid' }, output: { format: 'png' } }),
            })
            const data: RenderResult = await res.json()
            const msg = data.error ?? `HTTP ${res.status}`
            Sentry.captureException(new Error(`Sentry test: ${msg}`))
            alert(`Sentry に送信: ${msg}`)
          }}
        >
          Sentry テスト
        </button>

        {elapsed !== null && (
          <p className={styles.elapsed}>
            応答時間: <strong>{elapsed} ms</strong>
            {elapsed > 3000 && ' ⚠ コールドスタートの可能性'}
          </p>
        )}

        {status === 'error' && error && (
          <p className={styles.error}>エラー: {error}</p>
        )}

        {status === 'success' && image && (
          <img
            src={`data:image/png;base64,${image}`}
            alt="Generated confusion matrix"
            className={styles.preview}
          />
        )}
      </section>

      <section className={styles.card}>
        <h2>検証チェックリスト</h2>
        <ul className={styles.checklist}>
          <li>matplotlib が Vercel 上で動作する</li>
          <li>パッケージサイズが 250MB 以内に収まる</li>
          <li>コールドスタートが 3 秒以内（応答時間で確認）</li>
          <li>Sentry でエラーが捕捉できる（別途設定）</li>
        </ul>
      </section>
    </div>
  )
}

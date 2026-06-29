import { useState } from 'react'

interface Props {
  onParse: (data: number[][]) => void
}

function parseMatrix(text: string): number[][] | null {
  try {
    const rowMatches = [...text.matchAll(/\[\s*([\d\s.]+?)\s*\]/g)]
    if (!rowMatches.length) return null
    const rows = rowMatches.map((m) =>
      m[1].trim().split(/\s+/).map(Number)
    )
    const n = rows[0].length
    if (rows.length !== n || rows.some((r) => r.length !== n)) return null
    if (rows.flat().some(isNaN)) return null
    return rows
  } catch {
    return null
  }
}

export default function SklearnPaste({ onParse }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handle = () => {
    const matrix = parseMatrix(text)
    if (!matrix) {
      setError('解析できませんでした。sklearn の confusion_matrix() の出力を貼り付けてください。')
      return
    }
    setError(null)
    onParse(matrix)
    setText('')
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        <code>print(confusion_matrix(y_true, y_pred))</code> の出力を貼り付け
      </p>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setError(null) }}
        placeholder={'[[45  3]\n [ 2 50]]'}
        rows={4}
        className="w-full text-sm font-mono border border-gray-300 rounded px-3 py-2
          focus:outline-none focus:border-blue-400 resize-none"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handle}
        disabled={!text.trim()}
        className="w-full py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700
          disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        読み込む
      </button>
    </div>
  )
}

interface Props {
  b64: string | null
  loading: boolean
  error: string | null
  onDownload: () => void
}

export default function FigurePreview({ b64, loading, error, onDownload }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-200 min-h-64 relative">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">生成中...</span>
          </div>
        )}
        {!loading && error && (
          <p className="text-red-500 text-sm px-4 text-center">{error}</p>
        )}
        {!loading && !error && b64 && (
          <img
            src={`data:image/png;base64,${b64}`}
            alt="Generated figure"
            className="max-w-full max-h-full object-contain"
          />
        )}
        {!loading && !error && !b64 && (
          <p className="text-gray-300 text-sm">データを入力するとプレビューが表示されます</p>
        )}
      </div>

      <button
        onClick={onDownload}
        disabled={!b64 || loading}
        className="mt-3 w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium
          hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        PNG をダウンロード
      </button>
    </div>
  )
}

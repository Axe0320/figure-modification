interface Props {
  b64: string | null
  loading: boolean
  error: string | null
  onDownload: () => void
}

export default function FigurePreview({ b64, loading, error, onDownload }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 flex items-center justify-center bg-white min-h-64 relative"
        style={{
          border: '1px solid #E5E7EB',
          borderRadius: 14,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {loading && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin"
              style={{ borderTopColor: '#6C63FF' }}
            />
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
            className="max-w-full max-h-full object-contain p-4"
          />
        )}
        {!loading && !error && !b64 && (
          <p className="text-gray-300 text-sm">データを入力するとプレビューが表示されます</p>
        )}
      </div>

      <button
        onClick={onDownload}
        disabled={!b64 || loading}
        className="mt-3 w-full py-2 px-4 text-white text-sm font-semibold transition-all"
        style={{
          background: !b64 || loading ? '#D1D5DB' : '#6C63FF',
          borderRadius: 14,
          cursor: !b64 || loading ? 'not-allowed' : 'pointer',
          boxShadow: !b64 || loading ? 'none' : 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => {
          if (!(!b64 || loading)) (e.currentTarget as HTMLButtonElement).style.background = '#5a52e0'
        }}
        onMouseLeave={(e) => {
          if (!(!b64 || loading)) (e.currentTarget as HTMLButtonElement).style.background = '#6C63FF'
        }}
      >
        PNG をダウンロード
      </button>
    </div>
  )
}

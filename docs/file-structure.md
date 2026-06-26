# ファイル構造

```
figure-modification/
├── src/
│   ├── components/
│   │   ├── input/
│   │   │   ├── CreateMode.tsx
│   │   │   ├── UploadMode.tsx
│   │   │   └── DataInput/
│   │   │       ├── ManualInput.tsx
│   │   │       ├── SklearnPaste.tsx
│   │   │       └── CsvPaste.tsx
│   │   ├── editor/
│   │   │   ├── FigureEditor.tsx
│   │   │   ├── ColorEditor.tsx
│   │   │   ├── TextEditor.tsx
│   │   │   ├── LabelEditor.tsx
│   │   │   └── SizeEditor.tsx          # cm/inch指定（ジャーナル対応）
│   │   ├── compose/
│   │   │   ├── Composer.tsx
│   │   │   ├── GridLayout.tsx          # react-grid-layout
│   │   │   └── FreeLayout.tsx          # react-rnd
│   │   └── preview/
│   │       └── FigurePreview.tsx       # ローディング状態込み
│   │
│   ├── store/
│   │   └── figureStore.ts              # Zustand（preview は持たない）
│   │
│   ├── cache/
│   │   └── previewCache.ts             # Phase 1〜2: Map、Phase 3〜: IndexedDB
│   │
│   ├── api/
│   │   └── figureApi.ts                # POST /api/render（デバウンス込み）
│   │
│   ├── types/
│   │   └── figures.ts
│   │
│   └── App.tsx
│
├── api/
│   ├── render.py                       # 単一エンドポイント
│   └── _lib/
│       ├── common.py                   # fig_to_bytes・バリデーション・エラー処理
│       ├── confusion_matrix.py         # Phase 1
│       ├── heatmap.py                  # Phase 2
│       ├── bar_chart.py                # Phase 4
│       ├── line_plot.py                # Phase 4
│       ├── scatter_plot.py             # Phase 4
│       ├── histogram.py                # Phase 4
│       ├── roc_curve.py                # Phase 5
│       ├── pr_curve.py                 # Phase 5
│       ├── learning_curve.py           # Phase 5
│       ├── feature_importance.py       # Phase 5
│       ├── box_plot.py                 # Phase 7
│       ├── violin_plot.py              # Phase 7
│       └── error_bar.py                # Phase 7
│
├── requirements.txt                    # バージョン固定
├── vercel.json
├── vite.config.ts
└── package.json
```

## 各ディレクトリの役割

### src/components/

| ディレクトリ | 役割 |
|---|---|
| input/ | データ入力モード（Create / Upload）と入力形式 |
| editor/ | 図のパラメータ編集パネル |
| compose/ | 複数図の配置・合成 |
| preview/ | 生成された図のプレビュー表示 |

### src/store/

Zustand で管理する状態。`preview`（Base64）は**持たない**。
プレビューは `cache/previewCache.ts` で別管理。

### src/cache/

| Phase | 実装 |
|---|---|
| Phase 1〜2 | `Map<string, string>`（シンプル） |
| Phase 3〜 | `idb`（IndexedDB）へ移行。Composeで複数図のBase64を永続化 |

### api/

Vercel Functions として動作する Python スクリプト。
`render.py` が単一エンドポイントとして受け取り、`_lib/` 配下のモジュールへ委譲する。
各 `_lib/` モジュールは `matplotlib.Figure` を返すだけで、Base64化は `render.py` が担当。

### api/_lib/ の図種とフェーズ対応

| ファイル | 図種 | Phase |
|---|---|---|
| confusion_matrix.py | 混合行列 | 1 |
| heatmap.py | 相関行列・汎用ヒートマップ | 2 |
| bar_chart.py | 棒グラフ | 4 |
| line_plot.py | 折れ線グラフ | 4 |
| scatter_plot.py | 散布図 | 4 |
| histogram.py | ヒストグラム | 4 |
| roc_curve.py | ROC曲線 | 5 |
| pr_curve.py | Precision-Recall曲線 | 5 |
| learning_curve.py | 学習曲線 | 5 |
| feature_importance.py | 特徴量重要度 | 5 |
| box_plot.py | 箱ひげ図 | 7 |
| violin_plot.py | バイオリン図 | 7 |
| error_bar.py | エラーバー付き棒グラフ | 7 |

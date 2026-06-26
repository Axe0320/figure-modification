# フロントエンド設計

## Zustand Store

```typescript
// src/store/figureStore.ts

interface FigureStore {
  figures: FigureState[]
  layout: ComposeLayout | null
  selectedId: string | null

  addFigure:     (fig: FigureState) => void
  updateFigure:  (id: string, updater: (fig: FigureState) => FigureState) => void
  removeFigure:  (id: string) => void
  setLayout:     (layout: ComposeLayout) => void
  setSelectedId: (id: string | null) => void
}
```

### 注意点

- `preview`（Base64文字列）は**Store に持たない**
- 200KB × 20枚 = 4MB になり、Zustand の更新が重くなるため
- プレビューは `previewCache.ts` で別管理する

---

## プレビューキャッシュ

```typescript
// src/cache/previewCache.ts

// Phase 1〜2: Map（シンプル、セッション内のみ）
const previewCache = new Map<string, string>()

export const setPreview   = (id: string, b64: string) => previewCache.set(id, b64)
export const getPreview   = (id: string) => previewCache.get(id) ?? null
export const clearPreview = (id: string) => previewCache.delete(id)
```

### Phase 3（Compose）以降での移行

Compose で複数図のBase64を保持する段階で `idb`（IndexedDB）に移行する。

```typescript
// Phase 3〜: idb を使った実装に切り替え
import { get, set, del } from 'idb-keyval'

export const setPreview   = (id: string, b64: string) => set(id, b64)
export const getPreview   = (id: string) => get<string>(id)
export const clearPreview = (id: string) => del(id)
```

インターフェースを統一しておくことで、移行時に呼び出し側を変更しなくて済む。

---

## API クライアント

```typescript
// src/api/figureApi.ts

import { debounce } from 'lodash-es'
import { setPreview } from '../cache/previewCache'

interface RenderRequest {
  type: string
  data: unknown
  params: unknown
  output: { format: OutputFormat }
}

const postRender = async (req: RenderRequest): Promise<string> => {
  const res = await fetch('/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error)
  }
  const { image } = await res.json()
  return image
}

// パラメータ変更のたびにAPIを叩かないよう400msデバウンス
export const debouncedRender = debounce(
  async (fig: FigureState, format: OutputFormat = 'png') => {
    const b64 = await postRender({ ...fig, output: { format } })
    setPreview(fig.id, b64)
  },
  400
)
```

---

## フロントエンド側バリデーション

APIを叩く前にフロントエンド側で入力を検証し、無効なリクエストを弾く。

```typescript
// src/api/figureApi.ts

export const validate = (fig: FigureState): string | null => {
  switch (fig.type) {
    case 'confusion_matrix':
      if (!fig.data.length)
        return 'データを入力してください'
      if (fig.data[0].length !== fig.data.length)
        return '正方行列を入力してください'
      break
    case 'bar_chart':
      if (!fig.data.labels.length)
        return 'ラベルを入力してください'
      break
    // ...図種ごとに追加
  }
  return null
}
```

---

## コンポーネント構成

### input/

| コンポーネント | 役割 |
|---|---|
| CreateMode.tsx | 図種選択 + データ入力モードの切り替え |
| UploadMode.tsx | PNG アップロード + OCR 確認画面 |
| DataInput/ManualInput.tsx | グリッド形式の手入力 |
| DataInput/SklearnPaste.tsx | sklearn の `classification_report` テキスト貼り付け |
| DataInput/CsvPaste.tsx | CSV 貼り付け |

### editor/

| コンポーネント | 役割 |
|---|---|
| FigureEditor.tsx | 図種に応じた編集パネルの切り替え |
| ColorEditor.tsx | カラーマップ選択・色指定 |
| TextEditor.tsx | フォントサイズ・フォントカラー |
| LabelEditor.tsx | 軸ラベル・タイトル・凡例 |
| SizeEditor.tsx | figsize（cm/inch）・DPI 指定 |

### compose/

| コンポーネント | 役割 |
|---|---|
| Composer.tsx | 複数図の管理・レイアウト切り替え |
| GridLayout.tsx | react-grid-layout によるグリッド配置 |
| FreeLayout.tsx | react-rnd によるドラッグ自由配置 |

### preview/

| コンポーネント | 役割 |
|---|---|
| FigurePreview.tsx | Base64 PNG の表示、ローディング・エラー状態の表示 |

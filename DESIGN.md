# figure-modification 設計ドキュメント

## 概要

Pythonで生成した図（混合行列・ヒートマップ・棒グラフ等）をブラウザ上で編集・再生成・合成するWebアプリ。
将来的に latex-table-composer / latex-figure-composer / citation-bibtex-converter と統合予定。

---

## 技術選定

| 項目 | 採用 | 理由 |
|---|---|---|
| フロントエンド | React + TypeScript + Vite | 既存3ツールと統一 |
| スタイル | Tailwind CSS | 同上 |
| State管理 | Zustand | Compose含む複雑な状態に最適 |
| Compose UI | react-rnd + react-grid-layout | 現フェーズでは十分、Konvaは将来要件が固まってから |
| バックエンド | Vercel Functions（Python） | matplotlib + seaborn、既存ツールと同一ホスティング |
| エラー監視 | Sentry | Python・JS両方のエラーを監視 |
| プレビューキャッシュ | Phase 1〜2: Map / Phase 3〜: IndexedDB | Composeで複数図を扱う段階で移行 |
| プリセット保存 | Supabase（任意） | Phase 4以降、需要が出たら追加 |

---

## フェーズ

| Phase | 内容 |
|---|---|
| **0** | **Vercel デプロイ検証（matplotlib動作・パッケージサイズ・コールドスタート計測）** |
| 1 | 混合行列：Create + 編集UI + 出力（真のMVP） |
| 2 | 相関行列・汎用ヒートマップ追加 |
| 3 | Compose：グリッド配置 → 自由配置の順、IndexedDB移行 |
| 4 | 棒グラフ・折れ線・散布図・ヒストグラム |
| 5 | ML評価系（ROC・PR曲線・学習曲線・特徴量重要度） |
| 6 | Upload + OCR（Pillow + Vision API オプション） |
| 7 | 統計系（箱ひげ図・バイオリン・エラーバー）← 需要確認後 |
| 8 | 既存3ツールとの統合（pnpm workspace） |

### Phase 0 検証内容

```
[ ] matplotlib + seaborn + numpy を含む /api/render.py を Vercel にデプロイ
[ ] パッケージサイズが 250MB 以内に収まることを確認
[ ] コールドスタート時間を実測（目安：3秒以内）
[ ] Sentry の Python・JS 両方のエラー捕捉を確認
```

---

## サービス構成

| サービス | 用途 | 導入時期 |
|---|---|---|
| Vercel | ホスティング + Python Functions | Phase 0 |
| Sentry | エラー監視（Python・JS） | Phase 0 |
| IndexedDB | プレビューキャッシュ（Compose以降） | Phase 3 |
| Supabase | プリセット保存・共有リンク（任意） | Phase 4以降 |

---

## 詳細ドキュメント

- [ファイル構造](docs/file-structure.md)
- [TypeScript 型定義](docs/types.md)
- [Python API 設計](docs/api.md)
- [フロントエンド設計](docs/frontend.md)
- [Phase 6 OCR パイプライン](docs/ocr.md)
- [Phase 8 統合計画](docs/integration.md)

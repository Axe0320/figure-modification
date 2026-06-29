# Figure Modification

**研究・論文向けの図表をブラウザ上で編集・再生成・合成するツール**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

## 概要

機械学習・データ分析の研究で生成した図（混合行列・ヒートマップ・棒グラフ等）をブラウザ上でリアルタイム編集し、論文投稿品質の画像を出力するWebアプリケーション。

Pythonスクリプトを再実行することなく、フォント・色・軸ラベル・図サイズ（cm指定）・統計有意差ブラケットなどを即座に調整できます。バックエンドはVercel Functions（Python）で動作し、matplotlib + seabornが実際に図を描画します。

**公開URL：** https://figure-modification.vercel.app/

## 課題背景

千葉工業大学「Web3・AI概論」の課題として作成。研究では分析スクリプトとは別に「図を整形する作業」が毎回発生し、スクリプトを修正・再実行するサイクルが非効率でした。このツールはその整形作業をブラウザUIに切り出し、[LaTeX Table Composer](https://github.com/Axe0320/latex-table-composer) / [LaTeX Figure Composer](https://github.com/Axe0320/latex-figure-composer) / [Citation BibTeX Converter](https://github.com/Axe0320/citation-bibtex-converter) と統合する研究ツールチェーンの一部として設計されています。

## 対応図種（13種類）

| カテゴリ | 図種 |
|--------|------|
| データ表現 | 混合行列・ヒートマップ（相関行列含む） |
| 基本グラフ | 棒グラフ・折れ線・散布図・ヒストグラム |
| ML評価系 | ROC曲線・PR曲線・学習曲線・特徴量重要度 |
| 統計系 | 箱ひげ図・バイオリン図・エラーバー |

## 主な機能

### データ入力
- **手入力 / テキスト貼り付け**：各図種専用のUIから直接入力
- **sklearn貼り付け**：Pythonの `print()` 出力をそのまま貼り付け（混合行列等）
- **CSVアップロード**：全13図種に対応。ヒートマップはヘッダー自動検出、学習曲線はヘッダー行を系列名として使用
- **OCRインポート**：図の画像をアップロードしてVision AIでデータ自動抽出（後述）

### 編集機能
- タイトル・軸ラベル・フォントサイズ・図サイズ（cm）・DPI
- カラーマップ・カラーパレット（デフォルト / 学術 / パステル / ビビッドの4プリセット）
- グリッド・凡例・軸範囲・目盛り間隔
- 図種固有のパラメータ（正規化・括弧表示・内部表示・エッジカラー等）
- 統計有意差ブラケット（Welch's t検定・Mann-Whitney U検定等）

### 出力形式
- **PNG / SVG / PDF / EPS** の4形式に対応
- PNG はキャッシュから即座ダウンロード、SVG/PDF/EPS は専用レンダーパスで生成

### 複数図合成（Compose）
- グリッド配置・自由配置モードの切り替え
- 複数の図を1枚の画像として出力（論文のマルチパネル図向け）
- IndexedDBでセッション間も永続化、並び替え・削除対応

### OCRインポート（図 → データ抽出）
- アップロードした図画像をClaude / GPT-4o / Geminiで解析しデータを抽出
- APIキーはブラウザのlocalStorageにのみ保存（サーバーには送信しない）
- 抽出されたJSONをテキストエリアで確認・編集してから適用
- 折れ線・散布図はCanvasの手動点取り（4点軸較正）も選択可能

## 技術スタック

| カテゴリ | 採用技術 |
|---------|---------|
| フレームワーク | React 18 + TypeScript 5 |
| ビルド | Vite 6 |
| スタイリング | Tailwind CSS 4 |
| 状態管理 | Zustand 5 |
| 永続化 | IndexedDB（idb） |
| バックエンド | Vercel Functions（Python 3.12） |
| 図表描画 | matplotlib 3.8 + seaborn 0.13 + numpy 1.26 |
| Vision AI | Anthropic SDK ≥ 0.40（Claude Vision） |
| エラー監視 | Sentry（React + Python） |
| AIアシスタント | Claude Code（Anthropic） |
| デプロイ | Vercel |

## セットアップ

```bash
git clone https://github.com/Axe0320/figure-modification.git
cd figure-modification
npm install
npm run dev        # → http://localhost:5173
                   # Python APIは別途: vercel dev
npm run build
```

## ディレクトリ構成

```
src/
├── components/
│   ├── input/          # 図種別データ入力UI（13種）
│   ├── editor/         # パラメータ編集パネル（13種）
│   ├── compose/        # 複数図合成UI
│   ├── import/         # OCRインポート（モーダル・設定・確認・点取り）
│   ├── preview/        # 図プレビュー・ダウンロード
│   └── common/         # 共通コンポーネント（CSV読み込み・FigureList等）
├── api/
│   ├── figureApi.ts    # /api/render クライアント
│   └── ocrApi.ts       # /api/ocr クライアント
├── store/
│   └── figureStore.ts  # Zustand（図データ + レイアウト管理）
└── types/
    └── figures.ts      # TypeScript型定義（13図種全て）

api/
├── render.py           # POST /api/render（単一図生成）
├── compose.py          # POST /api/compose（複数図合成）
├── ocr.py              # POST /api/ocr（Vision AI連携）
├── stat_test.py        # POST /api/stat_test（統計検定）
└── _lib/               # 図種別レンダラー（13モジュール）
```

## 制限事項

- OCRインポートはサードパーティのVision APIキー（Anthropic / OpenAI / Google）が必要
- Vercel FunctionsのコールドスタートでAPIの初回レスポンスに最大3秒程度かかる場合がある
- 統計ブラケットは現在、対応2群比較のみ（多重比較補正は未対応）
- 複数図合成のエクスポートはPNGのみ（SVG/PDF対応は今後の予定）

## Roadmap

- [ ] 複数図合成のSVG/PDFエクスポート
- [ ] 統計検定の多重比較補正（Bonferroni・Holm）対応
- [ ] プリセット保存・共有リンク（Supabase連携）
- [ ] 既存3ツール（latex-table-composer等）との統合（pnpm workspace）
- [x] 出力形式選択（PNG / SVG / PDF / EPS）
- [x] CSVインポート（全13図種）
- [x] OCRインポート（Vision AI + Canvas手動点取り）
- [x] 複数図合成（グリッド / 自由配置）

## License

[MIT License](LICENSE)

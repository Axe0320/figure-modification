# Phase 8 統合計画

## 統合対象リポジトリ

| リポジトリ | 本番URL | バックエンド |
|---|---|---|
| latex-table-composer | https://latex-table-composer.vercel.app/ | なし（フロントエンドのみ） |
| latex-figure-composer | （Vercel デプロイ済み） | なし（フロントエンドのみ） |
| citation-bibtex-converter | https://citation-bibtex-converter.vercel.app/ | なし（フロントエンドのみ） |
| figure-modification | （本リポジトリ） | Vercel Functions（Python） |

---

## 統合後のディレクトリ構造

```
latex-tools/
├── apps/
│   ├── table-composer/         # 既存コードをそのまま移動
│   ├── figure-composer/
│   ├── citation-converter/
│   └── figure-modification/    # 本リポジトリのコードを移動
│
├── packages/
│   └── ui/                     # 共通UIコンポーネント（ナビ・ボタン等）
│
├── api/                        # figure-modification のみ使用
│   ├── render.py
│   └── _lib/
│
├── pnpm-workspace.yaml
└── vercel.json
```

---

## 移行方針

### pnpm workspace

4ツールが同一リポジトリに入るため、pnpm workspace でパッケージ管理を統一する。

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 共通コンポーネント（packages/ui）

各ツールで重複しているコンポーネント（ナビゲーション・ボタン・レイアウト）を
`packages/ui` に切り出して共有する。

### バックエンド

`api/` は figure-modification のみが使用する。
他の3ツールはフロントエンドのみで動作するため、変更不要。

### Turborepo

ビルド時間がボトルネックになってから導入を検討する。
現時点では不要。

---

## 移行タイミング

Phase 8 は figure-modification の Phase 1〜7 が一定程度完成してから着手する。
4ツール揃ってから1回の統合作業で済ませる方が、3ツール統合 → 後から1つ追加の2段階より効率的。

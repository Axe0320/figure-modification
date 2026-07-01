# 動作確認チェックリスト

figure-modification の全機能を一通り検証するための手順書です。  
Vercel デプロイ完了後、本番 URL（`https://figure-modification.vercel.app`）で実施してください。

---

## 事前準備

- [ ] デプロイが成功していることを Vercel ダッシュボードで確認
- [ ] ブラウザの DevTools を開いてコンソールエラーがないことを確認
- [ ] OCR 検証用に以下の API キーを手元に用意する
  - Anthropic API キー（Claude Vision）
  - OpenAI API キー（GPT-4o）
  - Google AI Studio API キー（Gemini）

---

## 1. 新規追加 3 図種の動作確認

### 1-1. 積み上げ棒グラフ (stacked_bar)

参照データ: `csv/stacked_bar.csv`

- [ ] ＋ボタン → 「積み上げ棒グラフ」を選択して図が追加される
- [ ] Labels: `human, goodbot, badbot`
- [ ] Series 追加 → 「Has Bot Words」: `77, 15, 3`
- [ ] Series 追加 → 「No Bot Words」: `3, 25, 38`
- [ ] 生成ボタン → 横積み上げ棒グラフが表示される
- [ ] Params: `orientation` を `vertical` に変更して縦棒に切り替わる
- [ ] Params: `normalize: true` にすると 100% 積み上げになる
- [ ] Params: `show_values: true` で各セグメントに数値が表示される

### 1-2. 棒+折れ線複合グラフ (combo_chart)

参照データ: `csv/combo_chart.csv`

- [ ] ＋ボタン → 「棒+折れ線複合」を選択して図が追加される
- [ ] Labels: `Q1, Q2, Q3, Q4`
- [ ] Bar series 追加 → 「売上（万円）」: `120, 185, 162, 240`
- [ ] Line series 追加 → 「成長率（%）」: `10.0, 54.2, -12.4, 48.1`
- [ ] 生成ボタン → 左軸に棒グラフ、右軸に折れ線グラフが表示される
- [ ] Params: `ylabel_left` / `ylabel_right` を設定して軸ラベルが変わる
- [ ] 凡例が両系列を正しくまとめて表示している

### 1-3. 円グラフ (pie_chart)

参照データ: `csv/pie_chart.csv`

- [ ] ＋ボタン → 「円グラフ」を選択して図が追加される
- [ ] Labels: `Deep Learning, Random Forest, SVM, Logistic Regression`
- [ ] Values: `38.5, 27.2, 19.8, 14.5`
- [ ] 生成ボタン → 円グラフが表示される（各スライスに % 表示）
- [ ] Params: `donut: 0.5` にするとドーナツグラフになる
- [ ] Params: `explode` の一部を `0.05` にすると該当スライスが飛び出す
- [ ] Params: `startangle: 90` で開始角度が変わる

---

## 2. タブ順序の確認

- [ ] 図種タブが以下のカテゴリ順で表示される
  1. 棒グラフ / 積み上げ棒グラフ / 棒+折れ線複合
  2. 折れ線グラフ / 散布図 / 円グラフ
  3. ヒストグラム / 箱ひげ図 / バイオリンプロット / エラーバー
  4. ヒートマップ / 混合行列
  5. ROC曲線 / PR曲線 / 学習曲線 / 特徴量重要度
- [ ] OCRモーダルの図種選択ボタンも同じ順序

---

## 3. OCR 動作確認

テスト画像: `images/` フォルダ内の PNG ファイルを使用する。  
設定画面（⚙️）で API キーを入力してから実施すること。

### 3-1. API キー設定

- [ ] ⚙️ アイコンをクリックして設定モーダルを開く
- [ ] Anthropic API キーを入力して保存
- [ ] OpenAI API キーを入力して保存
- [ ] Google (Gemini) API キーを入力して保存

### 3-2. Claude Vision

- [ ] 「図を読み込む (OCR)」を開く → プロバイダ「Claude」を選択（✓ マークあり）
- [ ] `images/bar_chart.png` をアップロード → 図の種類「棒グラフ」を選択
- [ ] 「解析開始」→ JSON 抽出結果が表示される
- [ ] `labels` と `values` が画像と一致していることを確認
- [ ] 「この内容で新規図に適用」→ 棒グラフが追加・レンダリングされる
- [ ] `images/confusion_matrix.png` で「混合行列」を OCR → 行列値が正しく抽出される

### 3-3. GPT-4o Vision

- [ ] プロバイダ「GPT-4o」を選択（✓ マークあり）
- [ ] `images/stacked_bar.png` → 「積み上げ棒グラフ」で解析
- [ ] `images/pie_chart.png` → 「円グラフ」で解析
- [ ] 抽出 JSON を確認 → 「適用」で図を追加

### 3-4. Gemini Vision

- [ ] プロバイダ「Gemini」を選択（✓ マークあり）
- [ ] `images/combo_chart.png` → 「棒+折れ線複合」で解析
- [ ] `images/heatmap.png` → 「ヒートマップ」で解析
- [ ] 抽出 JSON を確認 → 「適用」で図を追加

### 3-5. Tesseract.js（ローカル）

- [ ] プロバイダ「Tesseract (ローカル)」を選択
- [ ] `images/confusion_matrix.png` → 「混合行列」で解析（最も得意な図種）
- [ ] 抽出結果が表示される（数値は正確でなくてもよい、クラッシュしないこと）

---

## 4. 既存図種のリグレッション確認

各図種で「データ入力 → 生成」が正常に動くことを確認する。

| 図種 | 参照CSV | 確認 |
|------|---------|------|
| 棒グラフ | `csv/bar_chart.csv` | [ ] |
| 折れ線グラフ | `csv/line_plot.csv` | [ ] |
| 散布図 | `csv/scatter_plot.csv` | [ ] |
| ヒストグラム | `csv/histogram.csv` | [ ] |
| 箱ひげ図 | `csv/box_plot.csv` | [ ] |
| バイオリンプロット | `csv/violin_plot.csv` | [ ] |
| エラーバー | `csv/error_bar.csv` | [ ] |
| ヒートマップ | `csv/heatmap.csv` | [ ] |
| 混合行列 | `csv/confusion_matrix.csv` | [ ] |
| ROC曲線 | `csv/roc_curve.csv` | [ ] |
| PR曲線 | `csv/pr_curve.csv` | [ ] |
| 学習曲線 | `csv/learning_curve.csv` | [ ] |
| 特徴量重要度 | `csv/feature_importance.csv` | [ ] |

---

## 5. 手動点取り (PointDigitizer) の確認

折れ線・散布図は OCR でなく Canvas 上での手動点取りを使う。

- [ ] 「図を読み込む (OCR)」→ 図種「折れ線グラフ」を選択
- [ ] `images/line_plot.png` をアップロード
- [ ] 「手動点取りを開始」→ Canvas に画像が表示される
- [ ] 軸範囲を設定し、系列を 2 本追加して点を打つ
- [ ] 「完了」→ 抽出確認画面 → 「適用」で折れ線グラフが追加される

---

## 6. Compose モードの確認

複数の図を合成して 1 枚の PNG を出力する機能。

- [ ] 少なくとも 3 つの図を追加してレンダリングする
- [ ] ヘッダーの「Compose」トグルをオン
- [ ] 各図のチェックボックスで合成対象を選択（2 枚以上）
- [ ] レイアウト（Grid / Vertical / Horizontal）を切り替え
- [ ] 「Compose して出力」→ PNG がダウンロードされる
- [ ] ダウンロードした PNG に選択した図が全て含まれている

---

## 7. 永続化・状態管理の確認

- [ ] 図を複数追加してデータを入力 → ページをリロード → データが復元される（IndexedDB）
- [ ] 図チップの複製ボタン（⎘）→ 同じデータの図が複製される
- [ ] 図チップの ✕ ボタン → 図が削除される（最後の 1 枚は削除不可）
- [ ] Import / Export ボタン → JSON ファイルのエクスポートと再インポートが正常動作

---

## テスト画像一覧

| ファイル名 | 図種 | 説明 |
|-----------|------|------|
| `bar_chart.png` | 棒グラフ | 手法別 Precision/Recall 比較 |
| `stacked_bar.png` | 積み上げ棒グラフ | アカウント種別×ボット語彙の有無 |
| `combo_chart.png` | 棒+折れ線複合 | 四半期売上と成長率 |
| `pie_chart.png` | 円グラフ | モデル使用率分布 |
| `confusion_matrix.png` | 混合行列 | 3クラス分類結果 |
| `heatmap.png` | ヒートマップ | Feature A–D 相関行列 |
| `line_plot.png` | 折れ線グラフ | エポック別精度推移 |
| `scatter_plot.png` | 散布図 | 2グループ散布 |

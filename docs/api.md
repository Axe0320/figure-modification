# Python API 設計

## エンドポイント

単一エンドポイントに統一。`FigureType` による内部分岐。

```
POST /api/render
```

### リクエスト

```json
{
  "type": "confusion_matrix",
  "data": [[45, 3], [2, 50]],
  "params": {
    "title": "Confusion Matrix",
    "fontsize": 12,
    "figsize_cm": [10, 8],
    "dpi": 300,
    "colormap": "Blues",
    "normalize": false,
    "labels": ["Cat", "Dog"],
    "show_values": true
  },
  "output": {
    "format": "png"
  }
}
```

`output.format` は `params` に含めない。レンダリング方法であり図のパラメータではないため。

### レスポンス

```json
{ "image": "<base64エンコードされた画像>" }
```

### エラーレスポンス

```json
{ "error": "Invalid data shape: expected 2D array" }
```

---

## render.py（単一エンドポイント）

```python
# api/render.py

import importlib, json, base64
from http.server import BaseHTTPRequestHandler
from api._lib.common import fig_to_bytes, error_response

HANDLER_MODULES = {
    'confusion_matrix':    'api._lib.confusion_matrix',
    'heatmap':             'api._lib.heatmap',
    'bar_chart':           'api._lib.bar_chart',
    'line_plot':           'api._lib.line_plot',
    'scatter_plot':        'api._lib.scatter_plot',
    'histogram':           'api._lib.histogram',
    'roc_curve':           'api._lib.roc_curve',
    'pr_curve':            'api._lib.pr_curve',
    'learning_curve':      'api._lib.learning_curve',
    'feature_importance':  'api._lib.feature_importance',
    'box_plot':            'api._lib.box_plot',
    'violin_plot':         'api._lib.violin_plot',
    'error_bar':           'api._lib.error_bar',
}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length      = int(self.headers.get('Content-Length', 0))
        body        = json.loads(self.rfile.read(length))
        figure_type = body.get('type')
        fmt         = body.get('output', {}).get('format', 'png')

        if figure_type not in HANDLER_MODULES:
            return error_response(self, 400, f'Unknown type: {figure_type}')

        # 遅延インポート：必要な図種のモジュールだけロードする
        # → コールドスタート時に全モジュールを読み込まないための対策
        module = importlib.import_module(HANDLER_MODULES[figure_type])

        try:
            fig = module.render(body['data'], body['params'])  # matplotlib.Figure を返す
            raw = fig_to_bytes(fig, fmt)                       # bytes を返す
            b64 = base64.b64encode(raw).decode()               # base64化は render.py が担当

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'image': b64}).encode())

        except ValueError as e:
            return error_response(self, 400, str(e))
        except Exception as e:
            return error_response(self, 500, str(e))
```

---

## common.py（共通処理）

```python
# api/_lib/common.py

import matplotlib
matplotlib.use('Agg')    # GUIバックエンド無効化（サーバーレス環境で必須）
import matplotlib.pyplot as plt
import io, json
from http.server import BaseHTTPRequestHandler

def fig_to_bytes(fig, fmt: str = 'png', dpi: int = 300) -> bytes:
    """
    matplotlib.Figure を bytes に変換する。
    base64化・JSON組み立ては render.py が担当する。
    """
    buf = io.BytesIO()
    fig.savefig(buf, format=fmt, dpi=dpi, bbox_inches='tight')
    plt.close(fig)    # メモリリーク防止
    return buf.getvalue()

def error_response(handler: BaseHTTPRequestHandler, status: int, message: str):
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps({'error': message}).encode())
```

---

## 各 _lib モジュールの規約

各モジュールは `render(data, params) -> matplotlib.Figure` を実装する。

- Base64化・保存・レスポンス組み立ては**行わない**
- `matplotlib.Figure` を返すだけ
- `fig_to_bytes()` での一元変換により、PNG / SVG / PDF / EPS の全形式出力に対応できる

```python
# api/_lib/confusion_matrix.py（例）

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def render(data: list, params: dict):
    figsize = _cm_to_inches(params['figsize_cm'])
    fig, ax = plt.subplots(figsize=figsize)

    d = np.array(data)
    if params.get('normalize'):
        d = d.astype(float) / d.sum(axis=1, keepdims=True)

    sns.heatmap(
        d,
        ax=ax,
        cmap=params.get('colormap', 'Blues'),
        annot=params.get('show_values', True),
        fmt='.2f' if params.get('normalize') else 'd',
        xticklabels=params.get('labels', 'auto'),
        yticklabels=params.get('labels', 'auto'),
    )

    ax.set_title(params.get('title', ''), fontsize=params.get('fontsize', 12))
    fig.tight_layout()
    return fig    # Figure を返すだけ

def _cm_to_inches(figsize_cm: list) -> tuple:
    return (figsize_cm[0] / 2.54, figsize_cm[1] / 2.54)
```

---

## requirements.txt

```
matplotlib==3.8.2
seaborn==0.13.2
numpy==1.26.4
Pillow==10.2.0
pytesseract==0.3.10
```

バージョンは固定して再現性を担保する。

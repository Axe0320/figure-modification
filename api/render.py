from http.server import BaseHTTPRequestHandler
import json
import base64
import io
import os

try:
    import sentry_sdk
    sentry_sdk.init(
        dsn=os.environ.get('SENTRY_DSN'),
        enabled=bool(os.environ.get('SENTRY_DSN')),
        environment=os.environ.get('VERCEL_ENV', 'development'),
    )
except Exception:
    sentry_sdk = None  # type: ignore

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
        except Exception:
            self._respond(400, {'error': 'Invalid JSON'})
            return

        figure_type = body.get('type')
        data        = body.get('data')
        params      = body.get('params', {})
        fmt         = body.get('output', {}).get('format', 'png')

        if figure_type != 'confusion_matrix':
            self._respond(400, {'error': f'Unknown type: {figure_type}'})
            return

        try:
            fig = _render_confusion_matrix(data, params)
            raw = _fig_to_bytes(fig, fmt, params.get('dpi', 150))
            b64 = base64.b64encode(raw).decode()
            self._respond(200, {'image': b64})
        except ValueError as e:
            self._respond(400, {'error': str(e)})
        except Exception as e:
            if sentry_sdk:
                sentry_sdk.capture_exception(e)
            self._respond(500, {'error': str(e)})

    def _respond(self, status: int, body: dict):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())


def _render_confusion_matrix(data: list, params: dict):
    if not data or not data[0]:
        raise ValueError('data is empty')
    if len(data) != len(data[0]):
        raise ValueError('data must be a square matrix')

    figsize_cm = params.get('figsize_cm', [10, 8])
    figsize_in = (figsize_cm[0] / 2.54, figsize_cm[1] / 2.54)

    arr = np.array(data, dtype=float)
    if params.get('normalize'):
        row_sums = arr.sum(axis=1, keepdims=True)
        arr = arr / np.where(row_sums == 0, 1, row_sums)
        fmt = '.2f'
    else:
        fmt = 'd'
        arr = arr.astype(int)

    fig, ax = plt.subplots(figsize=figsize_in)
    sns.heatmap(
        arr,
        ax=ax,
        cmap=params.get('colormap', 'Blues'),
        annot=bool(params.get('show_values', True)),
        fmt=fmt,
        xticklabels=params.get('labels', 'auto'),
        yticklabels=params.get('labels', 'auto'),
    )
    ax.set_title(params.get('title', ''), fontsize=params.get('fontsize', 12))
    fig.tight_layout()
    return fig


def _fig_to_bytes(fig, fmt: str = 'png', dpi: int = 150) -> bytes:
    buf = io.BytesIO()
    fig.savefig(buf, format=fmt, dpi=dpi, bbox_inches='tight')
    plt.close(fig)
    return buf.getvalue()

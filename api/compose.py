from http.server import BaseHTTPRequestHandler
import json
import base64
import importlib
import io
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import matplotlib
matplotlib.use('Agg')

from PIL import Image


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
        except Exception:
            self._respond(400, {'error': 'Invalid JSON'})
            return

        figures = body.get('figures', [])
        layout  = body.get('layout', {})
        fmt     = body.get('output', {}).get('format', 'png')
        dpi     = int(body.get('output', {}).get('dpi', 150))

        if not figures:
            self._respond(400, {'error': 'No figures provided'})
            return

        try:
            from _lib.common import fig_to_bytes

            rendered: list[bytes] = []
            for spec in figures:
                figure_type = spec.get('type', '')
                if not figure_type.replace('_', '').isalnum():
                    self._respond(400, {'error': f'Unknown type: {figure_type}'})
                    return

                try:
                    mod = importlib.import_module(f'_lib.{figure_type}')
                except ModuleNotFoundError as e:
                    if e.name == f'_lib.{figure_type}':
                        self._respond(400, {'error': f'Unknown type: {figure_type}'})
                    else:
                        self._respond(500, {'error': f'Dependency missing: {e}'})
                    return

                fig = mod.render(spec.get('data'), spec.get('params', {}))
                rendered.append(fig_to_bytes(fig, 'png', dpi))

            cols    = max(1, int(layout.get('gridCols', 2)))
            gap_cm  = float(layout.get('gap', 0.5))
            gap_px  = max(0, int(gap_cm * dpi / 2.54))

            imgs = [Image.open(io.BytesIO(b)).convert('RGB') for b in rendered]
            n    = len(imgs)
            rows = math.ceil(n / cols)

            col_widths  = [0] * cols
            row_heights = [0] * rows
            for i, img in enumerate(imgs):
                r, c = divmod(i, cols)
                col_widths[c]  = max(col_widths[c],  img.width)
                row_heights[r] = max(row_heights[r], img.height)

            total_w = sum(col_widths)  + gap_px * (cols + 1)
            total_h = sum(row_heights) + gap_px * (rows + 1)

            canvas = Image.new('RGB', (total_w, total_h), 'white')
            for i, img in enumerate(imgs):
                r, c = divmod(i, cols)
                x_base = gap_px * (c + 1) + sum(col_widths[:c])
                y_base = gap_px * (r + 1) + sum(row_heights[:r])
                x = x_base + (col_widths[c]  - img.width)  // 2
                y = y_base + (row_heights[r] - img.height) // 2
                canvas.paste(img, (x, y))

            out = io.BytesIO()
            canvas.save(out, 'PNG', dpi=(dpi, dpi))
            out.seek(0)
            b64 = base64.b64encode(out.read()).decode()
            self._respond(200, {'image': b64})

        except ValueError as e:
            self._respond(400, {'error': str(e)})
        except Exception as e:
            self._respond(500, {'error': str(e)})

    def _respond(self, status: int, body: dict):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

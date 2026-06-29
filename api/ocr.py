from http.server import BaseHTTPRequestHandler
import json
import base64
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from PIL import Image, ImageEnhance
    import io
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


def preprocess_image(image_b64: str) -> str:
    if not PIL_AVAILABLE:
        return image_b64
    img_data = base64.b64decode(image_b64)
    img = Image.open(io.BytesIO(img_data)).convert('RGB')
    w, h = img.size
    max_size = 1280
    if max(w, h) > max_size:
        ratio = max_size / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    img = ImageEnhance.Contrast(img).enhance(1.2)
    img = ImageEnhance.Sharpness(img).enhance(1.1)
    buf = io.BytesIO()
    img.save(buf, format='PNG', optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
        except Exception:
            self._respond(400, {'error': 'Invalid JSON'})
            return

        image_b64   = body.get('image', '')
        figure_type = body.get('type', '')
        provider    = body.get('provider', 'claude')
        api_key     = body.get('api_key', '')

        if not image_b64:
            self._respond(400, {'error': '画像が必要です'})
            return
        if not api_key:
            self._respond(400, {'error': 'APIキーが必要です'})
            return

        try:
            processed = preprocess_image(image_b64)
        except Exception as e:
            self._respond(400, {'error': f'画像処理エラー: {e}'})
            return

        from _lib.vision import SCHEMAS, call_vision

        schema = SCHEMAS.get(figure_type)
        if schema is None:
            self._respond(400, {'error': f'未対応の図種: {figure_type}'})
            return

        try:
            result = call_vision(processed, figure_type, schema, provider, api_key)
            self._respond(200, {'extracted': result, 'type': figure_type})
        except Exception as e:
            self._respond(500, {'error': str(e)})

    def _respond(self, status: int, body: dict):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(body, ensure_ascii=False).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

import io
import os
import matplotlib.pyplot as plt


def setup_japanese_font() -> None:
    import matplotlib as mpl
    from matplotlib import font_manager
    mpl.rcParams['axes.unicode_minus'] = False
    font_path = os.path.join(os.path.dirname(__file__), 'ipaexg.ttf')
    if os.path.exists(font_path):
        font_manager.fontManager.addfont(font_path)
        mpl.rcParams['font.family'] = 'IPAexGothic'


def fig_to_bytes(fig, fmt: str = 'png', dpi: int = 150) -> bytes:
    buf = io.BytesIO()
    fig.savefig(buf, format=fmt, dpi=dpi, bbox_inches='tight')
    plt.close(fig)
    return buf.getvalue()

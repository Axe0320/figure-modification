import io
import matplotlib.pyplot as plt


def fig_to_bytes(fig, fmt: str = 'png', dpi: int = 150) -> bytes:
    buf = io.BytesIO()
    fig.savefig(buf, format=fmt, dpi=dpi, bbox_inches='tight')
    plt.close(fig)
    return buf.getvalue()

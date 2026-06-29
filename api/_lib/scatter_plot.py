import numpy as np
import matplotlib.pyplot as plt
from _lib.common import setup_japanese_font, apply_common_axes

setup_japanese_font()


def render(data: dict, params: dict):
    x = data.get('x', [])
    y = data.get('y', [])
    if not x or not y:
        raise ValueError('x と y を指定してください')
    if len(x) != len(y):
        raise ValueError('x と y の長さが一致しません')

    w_cm, h_cm = params.get('figsize_cm', [12, 10])
    fig, ax = plt.subplots(figsize=(w_cm / 2.54, h_cm / 2.54))

    ax.scatter(
        np.array(x, dtype=float),
        np.array(y, dtype=float),
        color=params.get('color', '#6C63FF'),
        s=params.get('marker_size', 40),
        alpha=params.get('alpha', 0.7),
        zorder=2,
    )

    tick_fs = params.get('tick_fontsize', 10)
    ax.tick_params(labelsize=tick_fs)
    ax.set_title(params.get('title',  ''), fontsize=params.get('fontsize', 12))
    ax.set_xlabel(params.get('xlabel', ''), fontsize=params.get('fontsize', 11))
    ax.set_ylabel(params.get('ylabel', ''), fontsize=params.get('fontsize', 11))

    apply_common_axes(ax, params)

    fig.tight_layout()
    return fig

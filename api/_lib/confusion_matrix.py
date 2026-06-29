import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import importlib.util
import os


def _setup_japanese_font() -> str:
    """Try multiple strategies to register a CJK-capable font. Returns font name or 'default'."""
    import matplotlib as mpl
    mpl.rcParams['axes.unicode_minus'] = False

    # Strategy 1: japanize_matplotlib — registers IPAexGothic automatically
    try:
        import japanize_matplotlib  # noqa: F401
        mpl.rcParams['font.family'] = 'IPAexGothic'
        return 'IPAexGothic (japanize_matplotlib)'
    except Exception:
        pass

    # Strategy 2: locate the .ttf bundled inside the japanize_matplotlib package
    # directory even if its __init__.py failed to execute
    try:
        spec = importlib.util.find_spec('japanize_matplotlib')
        if spec and spec.origin:
            font_path = os.path.join(os.path.dirname(spec.origin), 'ipaexg.ttf')
            if os.path.exists(font_path):
                from matplotlib import font_manager
                font_manager.fontManager.addfont(font_path)
                mpl.rcParams['font.family'] = 'IPAexGothic'
                return 'IPAexGothic (direct path)'
    except Exception:
        pass

    # Strategy 3: search system fonts for any CJK-capable face
    try:
        from matplotlib import font_manager
        keywords = ['ipa', 'noto', 'gothic', 'mincho', 'cjk', 'meiryo', 'hiragino', 'yu']
        for fp in font_manager.findSystemFonts():
            if any(k in os.path.basename(fp).lower() for k in keywords):
                font_manager.fontManager.addfont(fp)
                name = font_manager.FontProperties(fname=fp).get_name()
                mpl.rcParams['font.family'] = name
                return f'{name} (system)'
    except Exception:
        pass

    return 'default (no CJK font found)'


# Module-level setup — runs once per process / warm start
_FONT_INFO = _setup_japanese_font()


# Approximate margins (inches) for colorbar, axis labels, title.
_MARGIN_W_IN = 4.0 / 2.54
_MARGIN_H_IN = 3.0 / 2.54


def render(data: list, params: dict):
    if not data or not data[0]:
        raise ValueError('data is empty')
    if len(data) != len(data[0]):
        raise ValueError('data must be a square matrix')

    n = len(data)

    cell_size_cm = params.get('cell_size_cm')
    if cell_size_cm and float(cell_size_cm) > 0:
        cell_in = float(cell_size_cm) / 2.54
        figsize_in = (n * cell_in + _MARGIN_W_IN, n * cell_in + _MARGIN_H_IN)
    else:
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

    raw_labels = params.get('labels', 'auto')
    if isinstance(raw_labels, list):
        labels = [str(l).replace('\\n', '\n') for l in raw_labels]
    else:
        labels = raw_labels

    linewidths     = float(params.get('linewidths', 0.1))
    linecolor      = params.get('linecolor', 'black')
    fontsize       = params.get('fontsize', 12)
    annot_fontsize = params.get('annot_fontsize', 11)
    tick_fontsize  = params.get('tick_fontsize', 11)

    fig, ax = plt.subplots(figsize=figsize_in)
    sns.heatmap(
        arr,
        ax=ax,
        cmap=params.get('colormap', 'Blues'),
        annot=bool(params.get('show_values', True)),
        fmt=fmt,
        xticklabels=labels,
        yticklabels=labels,
        linewidths=linewidths,
        linecolor=linecolor,
        annot_kws={'size': annot_fontsize},
    )

    ax.tick_params(axis='both', labelsize=tick_fontsize)
    ax.set_title(params.get('title', ''), fontsize=fontsize)

    xlabel = params.get('xlabel', 'Predicted Label')
    ylabel = params.get('ylabel', 'True Label')
    if xlabel:
        ax.set_xlabel(xlabel, fontsize=fontsize)
    if ylabel:
        ax.set_ylabel(ylabel, fontsize=fontsize)

    if params.get('xlabel_top', True):
        ax.xaxis.set_ticks_position('top')
        ax.xaxis.set_label_position('top')

    fig.tight_layout()
    return fig, _FONT_INFO

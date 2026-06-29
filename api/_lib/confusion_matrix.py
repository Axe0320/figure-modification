import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


def render(data: list, params: dict):
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

"""
テスト用画像生成スクリプト
OCR動作確認用のサンプル図を images/ フォルダに出力する
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'api'))

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

# Use the bundled IPAexGothic font for Japanese text
_font_path = os.path.join(os.path.dirname(__file__), '..', 'api', '_lib', 'ipaexg.ttf')
if os.path.exists(_font_path):
    fm.fontManager.addfont(_font_path)
    matplotlib.rcParams['font.family'] = 'IPAexGothic'
matplotlib.rcParams['axes.unicode_minus'] = False

OUT = os.path.join(os.path.dirname(__file__), 'images')
os.makedirs(OUT, exist_ok=True)

def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=120, bbox_inches='tight')
    plt.close(fig)
    print(f'  saved: {name}')

# --- 1. bar_chart ---
fig, ax = plt.subplots(figsize=(6, 4))
labels = ['手法A', '手法B', '手法C', '手法D']
v1 = [72.3, 85.1, 78.6, 91.4]
v2 = [68.9, 80.2, 75.3, 88.7]
x = np.arange(len(labels))
ax.bar(x - 0.2, v1, 0.4, label='Precision', color='#6C63FF')
ax.bar(x + 0.2, v2, 0.4, label='Recall',    color='#FF6584')
ax.set_xticks(x); ax.set_xticklabels(labels)
ax.set_ylabel('Score (%)'); ax.set_title('Model Comparison by Method')
ax.set_ylim(60, 100); ax.legend(); ax.grid(axis='y', linestyle='--', alpha=0.4)
save(fig, 'bar_chart.png')

# --- 2. stacked_bar ---
fig, ax = plt.subplots(figsize=(6, 4))
cats = ['human', 'goodbot', 'badbot']
true_pos  = np.array([77, 15, 3])
false_pos = np.array([3, 25, 38])
x = np.arange(len(cats))
ax.barh(x, true_pos,  0.6, label='Contains Bot Words: True',  color='#FF8C00')
ax.barh(x, false_pos, 0.6, left=true_pos, label='Contains Bot Words: False', color='#4472C4')
ax.set_yticks(x); ax.set_yticklabels(cats)
ax.set_xlabel('Number of Accounts')
ax.set_title('Presence of Bot-like Words in Profile by Account Type')
ax.legend(loc='lower right')
save(fig, 'stacked_bar.png')

# --- 3. combo_chart ---
fig, ax1 = plt.subplots(figsize=(7, 4))
quarters = ['Q1', 'Q2', 'Q3', 'Q4']
sales    = [120,  185,  162,  240]
growth   = [10.0, 54.2, -12.4, 48.1]
x = np.arange(len(quarters))
ax1.bar(x, sales, 0.5, color='#6C63FF', alpha=0.85, label='売上（万円）')
ax1.set_ylabel('売上（万円）'); ax1.set_ylim(0, 280)
ax2 = ax1.twinx()
ax2.plot(x, growth, 'o-', color='#EF4444', linewidth=2, markersize=6, label='成長率（%）')
ax2.set_ylabel('成長率（%）'); ax2.axhline(0, color='gray', linestyle='--', linewidth=0.8)
ax1.set_xticks(x); ax1.set_xticklabels(quarters)
ax1.set_title('Quarterly Sales and Growth Rate')
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')
fig.tight_layout()
save(fig, 'combo_chart.png')

# --- 4. pie_chart ---
fig, ax = plt.subplots(figsize=(6, 5))
slices = [38.5, 27.2, 19.8, 14.5]
lbls   = ['Deep Learning', 'Random Forest', 'SVM', 'Logistic Reg']
colors = ['#6C63FF', '#FF6584', '#43CFAA', '#FFB347']
ax.pie(slices, labels=lbls, colors=colors, autopct='%1.1f%%',
       startangle=90, pctdistance=0.8)
ax.set_title('Model Usage Distribution')
save(fig, 'pie_chart.png')

# --- 5. confusion_matrix ---
fig, ax = plt.subplots(figsize=(5, 4))
cm = np.array([[48, 2, 1], [3, 44, 3], [1, 2, 46]])
im = ax.imshow(cm, cmap='Blues')
for i in range(3):
    for j in range(3):
        ax.text(j, i, str(cm[i, j]), ha='center', va='center', fontsize=14,
                color='white' if cm[i,j] > 30 else 'black')
ax.set_xticks([0,1,2]); ax.set_yticks([0,1,2])
ax.set_xticklabels(['Cat A','Cat B','Cat C'])
ax.set_yticklabels(['Cat A','Cat B','Cat C'])
ax.set_xlabel('Predicted Label'); ax.set_ylabel('True Label')
ax.set_title('Confusion Matrix')
plt.colorbar(im, ax=ax)
fig.tight_layout()
save(fig, 'confusion_matrix.png')

# --- 6. heatmap ---
fig, ax = plt.subplots(figsize=(5, 4))
corr = np.array([
    [1.00,  0.82,  0.31, -0.15],
    [0.82,  1.00,  0.47, -0.08],
    [0.31,  0.47,  1.00,  0.62],
    [-0.15,-0.08,  0.62,  1.00],
])
feats = ['Feature A', 'Feature B', 'Feature C', 'Feature D']
im = ax.imshow(corr, cmap='RdBu_r', vmin=-1, vmax=1)
for i in range(4):
    for j in range(4):
        ax.text(j, i, f'{corr[i,j]:.2f}', ha='center', va='center', fontsize=9)
ax.set_xticks(range(4)); ax.set_xticklabels(feats, rotation=30, ha='right')
ax.set_yticks(range(4)); ax.set_yticklabels(feats)
ax.set_title('Correlation Matrix')
plt.colorbar(im, ax=ax)
fig.tight_layout()
save(fig, 'heatmap.png')

# --- 7. line_plot ---
fig, ax = plt.subplots(figsize=(6, 4))
x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
y1 = [0.65, 0.71, 0.76, 0.80, 0.83, 0.85, 0.87, 0.88, 0.89, 0.90]
y2 = [0.58, 0.64, 0.69, 0.73, 0.77, 0.80, 0.82, 0.84, 0.85, 0.86]
ax.plot(x, y1, 'o-', color='#6C63FF', linewidth=2, label='Model A')
ax.plot(x, y2, 's-', color='#FF6584', linewidth=2, label='Model B')
ax.set_xlabel('Epoch'); ax.set_ylabel('Accuracy')
ax.set_title('Training Accuracy over Epochs')
ax.set_ylim(0.5, 1.0); ax.legend(); ax.grid(linestyle='--', alpha=0.4)
save(fig, 'line_plot.png')

# --- 8. scatter_plot ---
fig, ax = plt.subplots(figsize=(5, 4))
np.random.seed(42)
x1 = np.random.normal(2.0, 0.5, 30); y1 = np.random.normal(3.0, 0.6, 30)
x2 = np.random.normal(4.5, 0.4, 30); y2 = np.random.normal(5.5, 0.5, 30)
ax.scatter(x1, y1, color='#6C63FF', alpha=0.7, s=50, label='Group A')
ax.scatter(x2, y2, color='#FF6584', alpha=0.7, s=50, label='Group B')
ax.set_xlabel('Variable X'); ax.set_ylabel('Variable Y')
ax.set_title('Scatter Plot: Two Groups')
ax.legend(); ax.grid(linestyle='--', alpha=0.3)
save(fig, 'scatter_plot.png')

print('\nAll 8 images generated in test/images/')

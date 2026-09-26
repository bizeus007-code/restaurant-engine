import os
from PIL import Image
import numpy as np
from collections import deque

src_path = '/Users/mesa/.gemini/antigravity/brain/d30812b2-0151-48db-b862-43bf318e2411/loqum_bull_icon_1789472468581.jpg'
im = Image.open(src_path).convert('RGBA')
w, h = im.size
arr = np.array(im, dtype=np.float32)

rgb = arr[:, :, :3]
# Luminance / brightness
lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]

# Outer flood fill from 4 corners to only remove external black background
# (preserving any dark shadows inside nostrils/eyes if any)
is_bg = np.zeros((h, w), dtype=bool)
visited = np.zeros((h, w), dtype=bool)
q = deque()

# Seeds: edges
for x in range(w):
    q.append((0, x))
    q.append((h - 1, x))
    visited[0, x] = True
    visited[h - 1, x] = True
for y in range(h):
    q.append((y, 0))
    q.append((y, w - 1))
    visited[y, 0] = True
    visited[y, w - 1] = True

threshold = 24.0 # outer black threshold

while q:
    y, x = q.popleft()
    if lum[y, x] <= threshold:
        is_bg[y, x] = True
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                visited[ny, nx] = True
                if lum[ny, nx] <= threshold:
                    q.append((ny, nx))

# Now smooth alpha at boundary:
alpha = np.ones((h, w), dtype=np.float32) * 255.0
alpha[is_bg] = 0.0

# For anti-aliased edge: pixels near boundary with lum between 8 and 45 get feathered alpha
for y in range(h):
    for x in range(w):
        if is_bg[y, x]:
            continue
        # check if it has background neighbor
        has_bg_neighbor = False
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and is_bg[ny, nx]:
                has_bg_neighbor = True
                break
        if has_bg_neighbor and lum[y, x] < 50.0:
            # feather alpha based on lum
            factor = np.clip((lum[y, x] - 8.0) / 42.0, 0.0, 1.0)
            alpha[y, x] = 255.0 * factor

# Clean isolated tiny spots if any
out_arr = np.dstack([rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2], alpha]).astype(np.uint8)
cutout = Image.fromarray(out_arr, mode='RGBA')

# Get bounding box of non-zero alpha
bbox = cutout.getbbox()
print('Bounding box:', bbox)
cropped = cutout.crop(bbox)

# Create 512x512 square transparent canvas
target_size = 512
canvas = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))

# Resize bull keeping aspect ratio to fit within 512x512 with margin (e.g. 480x480 max)
max_dim = 472
bw, bh = cropped.size
scale = max_dim / max(bw, bh)
new_w = int(round(bw * scale))
new_h = int(round(bh * scale))
resized_bull = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

# Center on canvas
ox = (target_size - new_w) // 2
oy = (target_size - new_h) // 2
canvas.paste(resized_bull, (ox, oy), resized_bull)

# Output paths
paths = [
    'public/icon.png',
    'src/app/icon.png',
    'app/icon.png',
    'src/app/apple-icon.png',
    'app/apple-icon.png',
]

for p in paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    canvas.save(p, 'PNG')
    print(f'Saved {p} (512x512)')

# Save favicon.ico with multiple sizes: 16, 32, 48, 64, 128, 256
ico_paths = [
    'public/favicon.ico',
    'src/app/favicon.ico',
    'app/favicon.ico'
]

for p in ico_paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    canvas.save(p, format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)])
    print(f'Saved {p} (multi-size ICO)')

# Also save preview in scratch
canvas.save('scratch/bull_icon_preview.png', 'PNG')
print('Preview saved to scratch/bull_icon_preview.png')


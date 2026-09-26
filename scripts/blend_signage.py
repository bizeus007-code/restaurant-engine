#!/usr/bin/env python3
"""
blend_signage.py
Seamlessly composites the authentic 'LOQUM ET' restaurant signage from the desktop capture
over the hero facade image in public/images/loqum-hero-master.jpg with 100% opaque solid letter bodies
and clean boundary feathering (no holes inside letters, no gray horizontal band in sky).
"""

import os
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def blend_signage():
    hero_path = 'public/images/loqum-hero-master.jpg'
    backup_path = 'public/images/loqum-hero-master.bak.jpg'
    desktop_path = '/Users/mesa/Desktop/Ekran Resmi 2026-09-15 00.17.57.png'

    if not os.path.exists(desktop_path):
        print(f"Source desktop image not found: {desktop_path}")
        return

    # Ensure pristine backup exists
    if not os.path.exists(backup_path):
        shutil.copyfile(hero_path, backup_path)
        print(f"Backed up {hero_path} -> {backup_path}")

    bak = Image.open(backup_path).convert('RGB')
    desktop = Image.open(desktop_path).convert('RGB')

    b_arr = np.array(bak).astype(np.float32)
    base = b_arr.copy()

    # 1. Clean old letters in backup image (x: 542..816)
    x_start, x_end = 542, 816
    w_inpaint = x_end - x_start

    # Inpaint sky region (y: 135..165)
    for y in range(135, 165):
        sky_left = b_arr[y, 520:540].mean(axis=0)
        sky_right = b_arr[y, 818:838].mean(axis=0)
        for x in range(x_start, x_end):
            t_x = (x - x_start) / w_inpaint
            alpha = 1.0
            if x < x_start + 8:
                alpha = (x - x_start) / 8.0
            elif x > x_end - 8:
                alpha = (x_end - x) / 8.0
            val = (1 - t_x) * sky_left + t_x * sky_right
            base[y, x] = (1 - alpha) * base[y, x] + alpha * val

    # Inpaint wood fascia region (y: 165..192)
    for y in range(165, 192):
        wood_left = b_arr[y, 520:540].mean(axis=0)
        wood_right = b_arr[y, 818:838].mean(axis=0)
        for x in range(x_start, x_end):
            t_x = (x - x_start) / w_inpaint
            alpha = 1.0
            if x < x_start + 8:
                alpha = (x - x_start) / 8.0
            elif x > x_end - 8:
                alpha = (x_end - x) / 8.0
            val = (1 - t_x) * wood_left + t_x * wood_right
            base[y, x] = (1 - alpha) * base[y, x] + alpha * val

    # 2. Extract precise letter silhouette mask from desktop capture
    w, h = desktop.size
    work = desktop.copy()
    for x in range(0, w, 12):
        try:
            ImageDraw.floodfill(work, (x, 0), (255, 0, 0), thresh=40)
            ImageDraw.floodfill(work, (x, 4), (255, 0, 0), thresh=40)
        except Exception:
            pass

    # Fill sky gap between LOQUM and ET
    for pt in [(375, 15), (380, 20), (385, 25), (390, 30)]:
        try:
            ImageDraw.floodfill(work, pt, (255, 0, 0), thresh=40)
        except Exception:
            pass

    w_arr = np.array(work)
    is_sky = (w_arr[:, :, 0] == 255) & (w_arr[:, :, 1] == 0) & (w_arr[:, :, 2] == 0)
    mask = np.where(is_sky, 0.0, 1.0).astype(np.float32)

    # Feather outer boundaries only (letters inside remain 100% solid)
    for x in range(w):
        if x < 48:
            mask[:, x] = 0.0
        elif x < 58:
            mask[:, x] *= (x - 48) / 10.0

    for x in range(w):
        if x > 532:
            mask[:, x] = 0.0
        elif x > 522:
            mask[:, x] *= (532 - x) / 10.0

    for y in range(h):
        if y > 122:
            mask[y, :] = 0.0
        elif y > 110:
            mask[y, :] *= (122 - y) / 12.0

    mask_img = Image.fromarray((mask * 255).astype(np.uint8), mode='L')
    mask_smooth = np.array(mask_img.filter(ImageFilter.GaussianBlur(0.5))).astype(np.float32) / 255.0

    # 3. Scaling to match facade proportions
    scale = 50.0 / 97.0
    sw = int(round(w * scale))
    sh = int(round(h * scale))

    d_scaled = desktop.resize((sw, sh), Image.Resampling.LANCZOS)
    d_arr = np.array(d_scaled).astype(np.float32)

    m_scaled = Image.fromarray((mask_smooth * 255).astype(np.uint8)).resize((sw, sh), Image.Resampling.LANCZOS)
    m_arr = np.array(m_scaled).astype(np.float32) / 255.0

    paste_x = 524
    paste_y = 135

    composite = base.copy()
    for c in range(3):
        composite[paste_y:paste_y+sh, paste_x:paste_x+sw, c] = (
            (1.0 - m_arr) * composite[paste_y:paste_y+sh, paste_x:paste_x+sw, c] +
            m_arr * d_arr[:, :, c]
        )

    res = Image.fromarray(np.clip(composite, 0, 255).astype(np.uint8))
    res.save(hero_path, 'JPEG', quality=95, subsampling=0)
    print(f"Updated {hero_path} successfully saved with quality=95.")

if __name__ == '__main__':
    blend_signage()

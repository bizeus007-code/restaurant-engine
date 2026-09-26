import os
import glob
import json

desktop = os.path.expanduser('~/Desktop')
candidates = glob.glob(os.path.join(desktop, '*[lL]oqum*')) + glob.glob(os.path.join(desktop, '*[mM]en[uü]*'))
print('Bulunan Klasörler:', candidates)

menu_dir = None
for c in candidates:
    if os.path.isdir(c):
        menu_dir = c
        break

if not menu_dir:
    # Also check without glob in case of exact names
    possible = [
        os.path.join(desktop, 'loqum menü'),
        os.path.join(desktop, 'loqum menu'),
        os.path.join(desktop, 'Loqum Menü'),
        os.path.join(desktop, 'Loqum Menu'),
        os.path.join(desktop, 'menu'),
        os.path.join(desktop, 'menü'),
    ]
    for p in possible:
        if os.path.isdir(p):
            menu_dir = p
            break

if not menu_dir:
    print('HATA: Masaüstünde menü klasörü bulunamadı!')
    try:
        all_desktop = os.listdir(desktop)
        print('Masaüstündeki tüm klasör ve dosyalar:', all_desktop)
    except Exception as e:
        print('Masaüstü okunamadı:', e)
    exit(1)

print(f'Hedef Klasör: {menu_dir}')
subdirs = sorted([d for d in os.listdir(menu_dir) if os.path.isdir(os.path.join(menu_dir, d)) and not d.startswith('.')])
print(f'Toplam Alt Klasör Sayısı: {len(subdirs)}')

inventory = {}
for sd in subdirs:
    sd_path = os.path.join(menu_dir, sd)
    files = sorted([f for f in os.listdir(sd_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif'))])
    inventory[sd] = files
    print(f'📁 {sd}: {len(files)} fotoğraf')
    for f in files[:5]:
        print(f'   - {f}')
    if len(files) > 5:
        print(f'   ... ve {len(files) - 5} dosya daha')

output_path = '/tmp/loqum_menu_inventory.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({'menu_dir': menu_dir, 'inventory': inventory}, f, ensure_ascii=False, indent=2)

print(f'\nEnvanter başarıyla kaydedildi: {output_path}')


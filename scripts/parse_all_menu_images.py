import os
import subprocess
import json
import re
import unicodedata

def normalize_text(text):
    return unicodedata.normalize('NFC', text)

menu_dir = '/Users/mesa/Desktop/loqum menü'
ocr_bin = '/Users/mesa/restaurant-engine/scripts/ocr_runner'

subdirs = sorted([d for d in os.listdir(menu_dir) if os.path.isdir(os.path.join(menu_dir, d)) and not d.startswith('.')])

all_items = []

for sd in subdirs:
    sd_norm = normalize_text(sd)
    sd_path = os.path.join(menu_dir, sd)
    files = sorted([f for f in os.listdir(sd_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))])
    
    print(f'Processing {sd_norm} ({len(files)} files)...')
    
    for f in files:
        f_path = os.path.join(sd_path, f)
        res = subprocess.run([ocr_bin, f_path], capture_output=True, text=True)
        raw_lines = [line.strip() for line in res.stdout.split('\n') if line.strip()]
        
        # Filter out UI chrome lines (like Opera, Dosya, Düzenle, url, time, etc.)
        junk_patterns = [
            r'^opera$', r'^dosya$', r'^düzenle$', r'^görün.*', r'^geçmiş$', r'^yer işaret.*',
            r'^geliştirici$', r'^pencere$', r'^yardım$', r'^adsiz.*', r'^loqum\s*et.*',
            r'^www\..*', r'^http.*', r'^\*o$', r'^tr$', r'^\d+\s*eyl.*', r'^\d+:\d+$',
            r'^[qaswdfgzxcvbnm\d\s]{1,6}$', r'^loqumet$', r'^\+$', r'^\-$', r'^adet$'
        ]
        
        filtered = []
        for line in raw_lines:
            line_clean = line.strip()
            is_junk = False
            for pat in junk_patterns:
                if re.search(pat, line_clean, re.IGNORECASE):
                    is_junk = True
                    break
            if not is_junk:
                filtered.append(line_clean)
        
        # Try to find price
        price = 0
        price_line_idx = -1
        for idx, line in enumerate(filtered):
            # matches like '550 ₺', '1.850 ₺', '1850 TL', '550'
            m = re.search(r'([\d\.,]+)\s*(?:₺|TL)?', line)
            if m and ('₺' in line or 'TL' in line or (m.group(1).replace('.','').isdigit() and len(m.group(1)) >= 2)):
                val_str = m.group(1).replace('.', '').replace(',', '')
                if val_str.isdigit():
                    p_val = int(val_str)
                    if 10 <= p_val <= 20000:
                        price = p_val
                        price_line_idx = idx
                        break
        
        all_items.append({
            'category_folder': sd_norm,
            'file_name': f,
            'source_path': f_path,
            'raw_lines': raw_lines,
            'filtered_lines': filtered,
            'detected_price': price
        })

output_file = '/tmp/loqum_all_extracted_products.json'
with open(output_file, 'w', encoding='utf-8') as out:
    json.dump(all_items, out, ensure_ascii=False, indent=2)

print(f'\nDone! Total items processed: {len(all_items)}')
print(f'Saved to {output_file}')


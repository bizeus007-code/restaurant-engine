# -*- coding: utf-8 -*-
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_luxury_menu_html import build_luxury_html

def main():
    print("=" * 80)
    print("  LOQUM ET STEAKHOUSE — 16 SAYFALIK RESMÎ FİYATSIZ BASKI MENÜSÜ VEKTÖREL PDF")
    print("  Tarım ve Orman Bakanlığı Standartlarında 22 Kural Alerjen Entegrasyonu")
    print("  Hedef Dosya: ~/Desktop/LOKUM_ET_TAM_MENU_FIYATSIZ.pdf")
    print("=" * 80)
    build_luxury_html(compile_pdf=True, hide_prices=True)
    print("=" * 80)
    print("  DERLEME VE DIŞA AKTARIM İŞLEMİ BAŞARIYLA TAMAMLANDI!")
    print("=" * 80)

if __name__ == '__main__':
    main()


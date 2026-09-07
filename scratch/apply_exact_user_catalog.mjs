import fs from "fs";

const rawDishes = [
  // YÖRESEL LEZZETLER
  { id: "kol-dolmasi-2-kisilik", category: "Yöresel", categorySlug: "yoresel", name: "Kol Dolması (2 Kişilik)", price: "₺ 1.300", priceNum: 1300, image: "/dishes/kol-dolmasi.png", desc: "12 saat kısık ateşte demlenen bütün kuzu kol dolması, bademli iç pilav ile bakır sahanda.", calories: 1450, prepTime: "35 dk", allergens: "Kuruyemiş (Badem)" },
  { id: "asci-tabagi", category: "Yöresel", categorySlug: "yoresel", name: "Aşçı Tabağı", price: "₺ 985", priceNum: 985, image: "/dishes/asci-tabagi.png", desc: "Tandır, kuzu incik, kol dolması ve pilavdan oluşan zengin konak seçkisi.", calories: 1150, prepTime: "20 dk", allergens: "Gluten" },
  { id: "keci-kavurmasi", category: "Yöresel", categorySlug: "yoresel", name: "Keçi Kavurması", price: "₺ 720", priceNum: 720, image: "/dishes/keci-kavurmasi.png", desc: "Taş fırında ağır ateşte pişen yöresel keçi kavurması.", calories: 650, prepTime: "20 dk", allergens: "Doğal Et (Alerjensiz)" },
  { id: "pilav-ustu-kol-dolmasi", category: "Yöresel", categorySlug: "yoresel", name: "Pilav Üstü Kuzu Kol Dolması", price: "₺ 690", priceNum: 690, image: "/dishes/pilav-ustu-kol-dolmasi.png", desc: "Bademli iç pilav üzerinde servis edilen kuzu kol eti.", calories: 820, prepTime: "15 dk", allergens: "Kuruyemiş (Badem), Gluten" },
  { id: "pilav-ustu-tandir", category: "Yöresel", categorySlug: "yoresel", name: "Pilav Üstü Tandır", price: "₺ 685", priceNum: 685, image: "/dishes/pilav-ustu-tandir.png", desc: "Taş fırında pişen kuzu tandır eti, tane pirinç pilavı ile.", calories: 780, prepTime: "15 dk", allergens: "Gluten" },
  { id: "firinda-kuzu-incik", category: "Yöresel", categorySlug: "yoresel", name: "Fırında Kuzu İncik", price: "₺ 680", priceNum: 680, image: "/dishes/firinda-kuzu-incik.png", desc: "Fırınlanmış kök sebzeler ve ilikli et sosu ile ağır pişirim.", calories: 710, prepTime: "20 dk", allergens: "Alerjensiz" },
  { id: "firin-agzi", category: "Yöresel", categorySlug: "yoresel", name: "Fırın Ağzı", price: "₺ 680", priceNum: 680, image: "/dishes/firin-agzi.png", desc: "Kuzu eti, sarımsak ve biberle tepside nar gibi kızartılan Diyarbakır klasiği.", calories: 740, prepTime: "25 dk", allergens: "Alerjensiz" },
  { id: "patlican-yataginda-incik", category: "Yöresel", categorySlug: "yoresel", name: "Patlıcan Yatağında Kuzu İncik", price: "₺ 670", priceNum: 670, image: "/dishes/patlicanli-incik.png", desc: "Közlenmiş patlıcan beğendi üzerinde yumuşacık kuzu incik.", calories: 680, prepTime: "20 dk", allergens: "Laktoz (Süt/Tereyağı)" },
  { id: "firinda-gerdan", category: "Yöresel", categorySlug: "yoresel", name: "Fırında Gerdan", price: "₺ 670", priceNum: 670, image: "/dishes/firinda-gerdan.png", desc: "Kemik suyunda lif lif ayrılan kuzu gerdan eti.", calories: 670, prepTime: "18 dk", allergens: "Alerjensiz" },
  { id: "kuzu-gerdan", category: "Yöresel", categorySlug: "yoresel", name: "Kuzu Gerdan", price: "₺ 670", priceNum: 670, image: "/dishes/kuzu-gerdan.png", desc: "Döküm tavada köz biber ve domates eşliğinde geleneksel gerdan.", calories: 640, prepTime: "15 dk", allergens: "Alerjensiz" },
  { id: "kuzu-haslama", category: "Yöresel", categorySlug: "yoresel", name: "Kuzu Haşlama", price: "₺ 670", priceNum: 670, image: "/dishes/kuzu-haslama.png", desc: "Şifalı ilikli et suyu, taze patates ve havuç ile haşlama.", calories: 580, prepTime: "15 dk", allergens: "Alerjensiz" },
  { id: "kekikli-kuzu-budu", category: "Yöresel", categorySlug: "yoresel", name: "Kekikli Kuzu Budu", price: "₺ 670", priceNum: 670, image: "/dishes/kekikli-kuzu-budu.png", desc: "Dağ kekiği aromalı fırınlanmış kuzu budu.", calories: 670, prepTime: "20 dk", allergens: "Alerjensiz" },
  { id: "kuzu-graten", category: "Yöresel", categorySlug: "yoresel", name: "Kuzu Graten", price: "₺ 680", priceNum: 680, image: "/dishes/kuzu-graten.png", desc: "Fırınlanmış kaşar kabuklu kuzu eti dilimleri.", calories: 730, prepTime: "20 dk", allergens: "Laktoz" },
  { id: "diyarbakir-kavurma", category: "Yöresel", categorySlug: "yoresel", name: "Diyarbakır Kavurma", price: "₺ 660", priceNum: 660, image: "/dishes/diyarbakir-kavurma.png", desc: "Kendi yağında meşe közünde demlenen geleneksel kavurma.", calories: 690, prepTime: "15 dk", allergens: "Alerjensiz" },
  { id: "sade-tandir", category: "Yöresel", categorySlug: "yoresel", name: "Sade Tandır", price: "₺ 560", priceNum: 560, image: "/dishes/sade-tandir.png", desc: "Kuyuda pişmiş tandır eti, tırnak pide ile.", calories: 620, prepTime: "15 dk", allergens: "Gluten (Pide)" },
  { id: "firin-guvec", category: "Yöresel", categorySlug: "yoresel", name: "Fırın Güveç", price: "₺ 480", priceNum: 480, image: "/dishes/firin-guvec.png", desc: "Toprak güveçte kuzu kuşbaşı, domates ve patlıcan uyumu.", calories: 520, prepTime: "20 dk", allergens: "Alerjensiz" },
  { id: "eksili-kofte", category: "Yöresel", categorySlug: "yoresel", name: "Ekşili Köfte", price: "₺ 480", priceNum: 480, image: "/dishes/eksili-kofte.png", desc: "Sumaklı yöresel sos eşliğinde konak köftesi.", calories: 510, prepTime: "18 dk", allergens: "Gluten" },
  { id: "etsiz-sebze-yemegi", category: "Yöresel", categorySlug: "yoresel", name: "Etsiz Sebze Yemeği", price: "₺ 475", priceNum: 475, image: "/dishes/sebze-yemegi.png", desc: "Mevsim sebzeleriyle hazırlanan hafif güveç.", calories: 310, prepTime: "15 dk", allergens: "Alerjensiz" },
  { id: "az-kavurma", category: "Yöresel", categorySlug: "yoresel", name: "Az Kavurma", price: "₺ 410", priceNum: 410, image: "/dishes/az-kavurma.png", desc: "Tek kişilik porsiyon Diyarbakır kavurması.", calories: 420, prepTime: "10 dk", allergens: "Alerjensiz" },
  { id: "az-tandir", category: "Yöresel", categorySlug: "yoresel", name: "Az Tandır", price: "₺ 410", priceNum: 410, image: "/dishes/az-tandir.png", desc: "Tek kişilik porsiyon taş fırın tandır eti.", calories: 390, prepTime: "10 dk", allergens: "Alerjensiz" },
  { id: "az-guvec", category: "Yöresel", categorySlug: "yoresel", name: "Az Güveç", price: "₺ 300", priceNum: 300, image: "/dishes/az-guvec.png", desc: "Küçük boy toprak kapta fırın güveç.", calories: 310, prepTime: "12 dk", allergens: "Alerjensiz" },

  // SPESİYALLER
  { id: "ozel-siparis-kaburga", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Özel Sipariş Kaburga", price: "₺ 1.650", priceNum: 1650, image: "/dishes/ozel-siparis-kaburga.png", desc: "Özel bakır tepside bademli iç pilavlı bütün kaburga ziyafeti.", calories: 2200, prepTime: "45 dk", allergens: "Kuruyemiş (Badem), Gluten" },
  { id: "beros-usulu-loqum-bonfile", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Beroş Usulü Loqum Bonfile", price: "₺ 920", priceNum: 920, image: "/dishes/beros-usulu-loqum-bonfile.png", desc: "Özel peynir sosu ve sote mevsim sebzeleri ile servis edilir.", calories: 780, prepTime: "20 dk", allergens: "Laktoz (Peynir)" },
  { id: "patates-yataginda-bonfile", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Patates Yatağında Bonfile", price: "₺ 910", priceNum: 910, image: "/dishes/patates-yataginda-bonfile.png", desc: "İpeksi patates püresi üzerinde ızgara dana bonfile.", calories: 720, prepTime: "20 dk", allergens: "Laktoz (Süt/Tereyağı)" },
  { id: "beros-usulu-acili-bonfile", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Beroş Usulü Acılı Bonfile", price: "₺ 910", priceNum: 910, image: "/dishes/beros-usulu-acili-bonfile.png", desc: "Diyarbakır köz acı biberi soslu marine bonfile.", calories: 690, prepTime: "20 dk", allergens: "Alerjensiz" },
  { id: "loqum-bonfile", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Loqum Bonfile", price: "₺ 900", priceNum: 900, image: "/dishes/loqum-bonfile.png", desc: "Tereyağında mühürlenmiş lokum bonfile ve kızarmış ekmek.", calories: 650, prepTime: "18 dk", allergens: "Gluten, Laktoz" },
  { id: "cokertme", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Çökertme", price: "₺ 845", priceNum: 845, image: "/dishes/cokertme.png", desc: "Çıtır kibrit patates, süzme yoğurt ve domates soslu dana bonfile.", calories: 820, prepTime: "22 dk", allergens: "Laktoz (Yoğurt), Gluten" },
  { id: "beros-special-1", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Beroş Special 1", price: "₺ 845", priceNum: 845, image: "/dishes/beros-special-1.png", desc: "Fırınlanmış kaşar erimesi, çıtır patates ve kuru meyveler ile.", calories: 860, prepTime: "25 dk", allergens: "Laktoz" },
  { id: "special-kuzu-sirt", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Beroş Special Kuzu Sırt", price: "₺ 725", priceNum: 725, image: "/dishes/special-kuzu-sirt.png", desc: "Lokum kıvamında marine edilmiş ızgara kuzu sırt dilimleri.", calories: 690, prepTime: "18 dk", allergens: "Alerjensiz" },
  { id: "ayvali-kavurma", category: "Spesiyaller", categorySlug: "spesiyaller", name: "Diyarbakır Ayvalı Kavurma", price: "₺ 725", priceNum: 725, image: "/dishes/ayvali-kavurma.png", desc: "Karamelize ayva dilimleri ve kuzu etinin bakır sahandaki lezzeti.", calories: 725, prepTime: "20 dk", allergens: "Alerjensiz" },

  // TAŞ FIRIN & PİDE
  { id: "sac-tava", category: "Taş Fırın & Pide", categorySlug: "tas-firin", name: "Sur Usulü Sac Tava", price: "₺ 800", priceNum: 800, image: "/dishes/sac-tava.png", desc: "Özel sac üzerinde domates, sarımsak ve biberle demlenen et ziyafeti.", calories: 840, prepTime: "18 dk", allergens: "Alerjensiz" },
  { id: "pide-1-5-kusbasili", category: "Taş Fırın & Pide", categorySlug: "tas-firin", name: "1,5 Porsiyon Kuşbaşılı Pide", price: "₺ 750", priceNum: 750, image: "/dishes/pide-1-5-kusbasili.png", desc: "Taş fırında çıtır pişen bol etli 1.5 porsiyon pide.", calories: 980, prepTime: "15 dk", allergens: "Gluten" },
  { id: "kusbasi-kasarli-pide", category: "Taş Fırın & Pide", categorySlug: "tas-firin", name: "Kuşbaşı Kaşarlı Pide", price: "₺ 595", priceNum: 595, image: "/dishes/kusbasi-kasarli-pide.png", desc: "Satır kuşbaşı eti ve erimiş kaşarın taş fırındaki uyumu.", calories: 880, prepTime: "15 dk", allergens: "Gluten, Laktoz" },
  { id: "kusbasi-pide", category: "Taş Fırın & Pide", categorySlug: "tas-firin", name: "Kuşbaşı Pide", price: "₺ 570", priceNum: 570, image: "/dishes/kusbasi-pide.png", desc: "Geleneksel hamur ve zırh kuşbaşı harcı ile.", calories: 760, prepTime: "15 dk", allergens: "Gluten" },
  { id: "kasarli-pide", category: "Taş Fırın & Pide", categorySlug: "tas-firin", name: "Kaşarlı Pide", price: "₺ 560", priceNum: 560, image: "/dishes/kasarli-pide.png", desc: "Halhalı tereyağı ve yoğun kaşar peynirli fırın klasiği.", calories: 790, prepTime: "12 dk", allergens: "Gluten, Laktoz" },
  { id: "kiymali-yumurtali-pide", category: "Taş Fırın & Pide", categorySlug: "tas-firin", name: "Kıymalı Yumurtalı Pide", price: "₺ 535", priceNum: 535, image: "/dishes/kiymali-yumurtali-pide.png", desc: "Özel baharatlı kıyma harcı ve köy yumurtası ile.", calories: 810, prepTime: "15 dk", allergens: "Gluten, Yumurta" },
  { id: "findik-lahmacun", category: "Taş Fırın & Pide", categorySlug: "tas-firin", name: "Fındık Lahmacun", price: "₺ 85", priceNum: 85, image: "/dishes/findik-lahmacun.png", desc: "Çıtır hamurlu mini konak lahmacunu.", calories: 160, prepTime: "10 dk", allergens: "Gluten" },

  // ARA SICAKLAR
  { id: "mumbar", category: "Ara Sıcaklar", categorySlug: "ara-sicak", name: "Mumbar", price: "₺ 480", priceNum: 480, image: "/dishes/mumbar.png", desc: "Döküm tencerede geleneksel baharatlı pirinç dolgulu mumbar.", calories: 620, prepTime: "15 dk", allergens: "Alerjensiz" },
  { id: "talas-boregi", category: "Ara Sıcaklar", categorySlug: "ara-sicak", name: "Talaş Böreği", price: "₺ 220", priceNum: 220, image: "/dishes/talas-boregi.png", desc: "Çıtır milföy içinde kuşbaşı et ve bezelyeli konak böreği.", calories: 490, prepTime: "12 dk", allergens: "Gluten, Laktoz, Yumurta" },
  { id: "icli-kofte", category: "Ara Sıcaklar", categorySlug: "ara-sicak", name: "İçli Köfte", price: "₺ 80", priceNum: 80, image: "/dishes/icli-kofte.png", desc: "Cevizli ve zırh kıymalı altın sarısı içli köfte.", calories: 280, prepTime: "10 dk", allergens: "Gluten, Kuruyemiş (Ceviz)" },
  { id: "corba", category: "Ara Sıcaklar", categorySlug: "ara-sicak", name: "Günün Çorbası", price: "₺ 150", priceNum: 150, image: "/dishes/corba.png", desc: "Geleneksel tereyağlı süzme mercimek çorbası.", calories: 180, prepTime: "5 dk", allergens: "Gluten, Laktoz" },
  { id: "patates-cips", category: "Ara Sıcaklar", categorySlug: "ara-sicak", name: "Patates Cips", price: "₺ 220", priceNum: 220, image: "/dishes/patates-cips.png", desc: "Altın sarısı çıtır patates kızartması tabağı.", calories: 380, prepTime: "8 dk", allergens: "Alerjensiz" },
  { id: "sade-pilav", category: "Ara Sıcaklar", categorySlug: "ara-sicak", name: "Sade Pirinç Pilavı", price: "₺ 130", priceNum: 130, image: "/dishes/sade-pilav.png", desc: "Tereyağlı tane tane pirinç pilavı.", calories: 290, prepTime: "5 dk", allergens: "Laktoz (Tereyağı)" },

  // TAVUK ÇEŞİTLERİ
  { id: "beros-tavuk-special", category: "Tavuk Çeşitleri", categorySlug: "tavuk", name: "Beroş Tavuk Special", price: "₺ 590", priceNum: 590, image: "/dishes/tavuk-special.png", desc: "Özel baharatlı ızgara tavuk bonfile dilimleri.", calories: 590, prepTime: "18 dk", allergens: "Alerjensiz" },
  { id: "ispanak-yataginda-tavuk", category: "Tavuk Çeşitleri", categorySlug: "tavuk", name: "Ispanak Yatağında Bonfile", price: "₺ 570", priceNum: 570, image: "/dishes/ispanakli-tavuk.png", desc: "Kremalı sote ıspanak üzerinde ızgara tavuk bonfile.", calories: 520, prepTime: "18 dk", allergens: "Laktoz (Krema)" },
  { id: "kori-soslu-tavuk", category: "Tavuk Çeşitleri", categorySlug: "tavuk", name: "Köri Soslu Tavuk", price: "₺ 550", priceNum: 550, image: "/dishes/kori-soslu-tavuk.png", desc: "Mantar, renkli biberler ve köri kremalı jülyen tavuk.", calories: 580, prepTime: "18 dk", allergens: "Laktoz (Krema)" },
  { id: "kremali-mantarli-tavuk", category: "Tavuk Çeşitleri", categorySlug: "tavuk", name: "Kremalı Mantarlı Tavuk", price: "₺ 550", priceNum: 550, image: "/dishes/kremali-tavuk.png", desc: "Taze kültür mantarları ve yoğun krema soslu tavuk.", calories: 610, prepTime: "18 dk", allergens: "Laktoz (Krema)" },
  { id: "beros-usulu-acili-tavuk", category: "Tavuk Çeşitleri", categorySlug: "tavuk", name: "Beroş Usulü Acılı Tavuk", price: "₺ 540", priceNum: 540, image: "/dishes/acili-tavuk.png", desc: "Diyarbakır acı biberi harmanlı tava tavuk.", calories: 530, prepTime: "16 dk", allergens: "Alerjensiz" },

  // ÇOCUK MENÜSÜ
  { id: "izgara-kofte", category: "Çocuk Menüsü", categorySlug: "cocuk", name: "Izgara Köfte", price: "₺ 550", priceNum: 550, image: "/dishes/izgara-kofte.png", desc: "Patates kızartması eşliğinde anne köftesi tabağı.", calories: 510, prepTime: "15 dk", allergens: "Gluten" },
  { id: "tavuk-nugget", category: "Çocuk Menüsü", categorySlug: "cocuk", name: "Tavuk Nugget", price: "₺ 510", priceNum: 510, image: "/dishes/tavuk-nugget.png", desc: "Çıtır kaplamalı tavuk parçaları ve patates kızartması.", calories: 460, prepTime: "12 dk", allergens: "Gluten, Yumurta" },

  // TATLILAR
  { id: "fistik-sarma", category: "Tatlılar", categorySlug: "tatli", name: "Fıstık Sarma", price: "₺ 490", priceNum: 490, image: "/dishes/fistik-sarma.png", desc: "Boz Antep fıstığından hazırlanan yoğun fıstık sarması.", calories: 540, prepTime: "5 dk", allergens: "Kuruyemiş (Antep Fıstığı), Gluten, Laktoz" },
  { id: "fistikli-baklava", category: "Tatlılar", categorySlug: "tatli", name: "Fıstıklı Baklava", price: "₺ 450", priceNum: 450, image: "/dishes/fistikli-baklava.png", desc: "Bol Antep fıstıklı, çıtır tereyağlı geleneksel baklava.", calories: 490, prepTime: "5 dk", allergens: "Kuruyemiş (Antep Fıstığı), Gluten, Laktoz" },
  { id: "fistikli-kadayif", category: "Tatlılar", categorySlug: "tatli", name: "Fıstıklı Burma Kadayıf", price: "₺ 430", priceNum: 430, image: "/dishes/fistikli-kadayif.png", desc: "Diyarbakır'ın tescilli çıtır burma kadayıfı.", calories: 480, prepTime: "5 dk", allergens: "Kuruyemiş (Antep Fıstığı), Gluten, Laktoz" },
  { id: "soguk-baklava", category: "Tatlılar", categorySlug: "tatli", name: "Soğuk Baklava", price: "₺ 400", priceNum: 400, image: "/dishes/soguk-baklava.png", desc: "Sütlü şerbet, bol fıstık ve Belçika çikolatası rendesi ile.", calories: 460, prepTime: "5 dk", allergens: "Kuruyemiş (Fıstık), Gluten, Laktoz" },
  { id: "kunefe", category: "Tatlılar", categorySlug: "tatli", name: "Künefe", price: "₺ 260", priceNum: 260, image: "/dishes/kunefe.png", desc: "Sıcak peynirli şerbetli tel kadayıf tatlısı.", calories: 520, prepTime: "12 dk", allergens: "Gluten, Laktoz" },
  { id: "kabak-tatlisi", category: "Tatlılar", categorySlug: "tatli", name: "Kabak Tatlısı", price: "₺ 240", priceNum: 240, image: "/dishes/kabak-tatlisi.png", desc: "Fırınlanmış bal kabağı, tahin ve iri ceviz taneleri ile.", calories: 320, prepTime: "5 dk", allergens: "Susam (Tahin), Kuruyemiş (Ceviz)" },
  { id: "dondurma-top", category: "Tatlılar", categorySlug: "tatli", name: "Dondurma (Top)", price: "₺ 60", priceNum: 60, image: "/dishes/dondurma-top.png", desc: "Hakiki Maraş dövme dondurması.", calories: 140, prepTime: "3 dk", allergens: "Laktoz" },

  // SOĞUKLAR & MEZE
  { id: "serpme-kahvalti", category: "Soğuklar", categorySlug: "soguklar", name: "Serpme Konak Kahvaltısı", price: "₺ 450", priceNum: 450, image: "/dishes/serpme-kahvalti.png", desc: "Yöresel peynirler, kavurmalı yumurta, bal-kaymak ziyafeti.", calories: 1200, prepTime: "10 dk", allergens: "Gluten, Laktoz, Yumurta, Susam" },
  { id: "kahvalti-tabagi", category: "Soğuklar", categorySlug: "soguklar", name: "Kahvaltı Tabağı", price: "₺ 350", priceNum: 350, image: "/dishes/kahvalti-tabagi.png", desc: "Tek kişilik zengin kahvaltı tabağı.", calories: 650, prepTime: "10 dk", allergens: "Gluten, Laktoz, Yumurta" },
  { id: "kasik-salatasi", category: "Soğuklar", categorySlug: "soguklar", name: "Kaşık Salatası", price: "₺ 250", priceNum: 250, image: "/dishes/kasik-salatasi.png", desc: "İnce kıyım domates, ceviz ve nar ekşisi soslu salata.", calories: 190, prepTime: "8 dk", allergens: "Kuruyemiş (Ceviz)" },
  { id: "kase-yogurt", category: "Soğuklar", categorySlug: "soguklar", name: "Kase Süzme Yoğurt", price: "₺ 220", priceNum: 220, image: "/dishes/kase-yogurt.png", desc: "Geleneksel köy sütü manda yoğurdu.", calories: 210, prepTime: "3 dk", allergens: "Laktoz" },

  // İÇECEKLER
  { id: "acik-ayran", category: "İçecekler", categorySlug: "icecekler", name: "Yayık Açık Ayran", price: "₺ 75", priceNum: 75, image: "/dishes/acik-ayran.png", desc: "Bakır maşrapada bol köpüklü taze yayık ayranı.", calories: 95, prepTime: "2 dk", allergens: "Laktoz" },
  { id: "kutu-mesrubat", category: "İçecekler", categorySlug: "icecekler", name: "Kutu Meşrubatlar", price: "₺ 80", priceNum: 80, image: "/dishes/kutu-mesrubat.png", desc: "Kola, Fanta, Sprite, Zero 330 ml kutu.", calories: 140, prepTime: "2 dk", allergens: "Alerjensiz" },
  { id: "salgam", category: "İçecekler", categorySlug: "icecekler", name: "Adana Şalgam Suyu", price: "₺ 75", priceNum: 75, image: "/dishes/salgam.png", desc: "Cam şişede geleneksel acılı veya acısız şalgam.", calories: 25, prepTime: "2 dk", allergens: "Alerjensiz" },
  { id: "limonata", category: "İçecekler", categorySlug: "icecekler", name: "Taze Ev Yapımı Limonata", price: "₺ 90", priceNum: 90, image: "/dishes/limonata.png", desc: "Taze sıkılmış nane yapraklı ev yapımı limonata.", calories: 120, prepTime: "3 dk", allergens: "Alerjensiz" }
];

// Normalize and add all compatibility fields
const normalizedDishes = rawDishes.map(d => ({
  id: d.id,
  category: d.category,
  categorySlug: d.categorySlug,
  name: d.name,
  subtitle: d.desc,
  description: d.desc,
  desc: d.desc,
  chefNote: d.desc,
  price: d.price,
  priceNum: d.priceNum,
  image: d.image,
  dishImage: d.image,
  calories: typeof d.calories === 'number' ? `${d.calories} kcal` : d.calories,
  prepTime: d.prepTime,
  allergens: d.allergens,
  temperature: "75°C",
  servingTemp: "75°C"
}));

console.log("Total exact items from prompt:", normalizedDishes.length);

// 1. Update data/live_restaurant.json
const liveDb = JSON.parse(fs.readFileSync("data/live_restaurant.json", "utf8"));
if (!liveDb.inventory) liveDb.inventory = {};
for (const d of normalizedDishes) {
  if (!liveDb.inventory[d.id]) {
    liveDb.inventory[d.id] = {
      count: d.categorySlug === "icecekler" ? 500 : 50,
      isUnlimited: d.categorySlug === "icecekler",
      isLocked: false
    };
  }
}
fs.writeFileSync("data/live_restaurant.json", JSON.stringify(liveDb, null, 2));
console.log("Live restaurant db inventory updated. Total items:", Object.keys(liveDb.inventory).length);

// 2. Update CATEGORIES & CATEGORY_NAMES & DISHES in app/page.tsx
let page = fs.readFileSync("app/page.tsx", "utf8");

const newCategories = `const CATEGORIES = [
  { id: "yoresel", slug: "yoresel", label: "YÖRESEL" },
  { id: "spesiyaller", slug: "spesiyaller", label: "SPESİYALLER" },
  { id: "tas-firin", slug: "tas-firin", label: "TAŞ FIRIN & PİDE" },
  { id: "ara-sicak", slug: "ara-sicak", label: "ARA SICAKLAR" },
  { id: "tavuk", slug: "tavuk", label: "TAVUK ÇEŞİTLERİ" },
  { id: "cocuk", slug: "cocuk", label: "ÇOCUK MENÜSÜ" },
  { id: "tatli", slug: "tatli", label: "TATLILAR" },
  { id: "soguklar", slug: "soguklar", label: "SOĞUKLAR & MEZE" },
  { id: "icecekler", slug: "icecekler", label: "İÇECEKLER" },
];`;

const newCatNames = `const CATEGORY_NAMES: Record<Language, Record<string, string>> = {
  TR: {
    yoresel: "YÖRESEL LEZZETLER",
    spesiyaller: "SPESİYALLER",
    "tas-firin": "TAŞ FIRIN & PİDE",
    "ara-sicak": "ARA SICAKLAR",
    tavuk: "TAVUK ÇEŞİTLERİ",
    cocuk: "ÇOCUK MENÜSÜ",
    tatli: "TATLILAR",
    soguklar: "SOĞUKLAR & MEZE",
    icecekler: "İÇECEKLER",
  },
  EN: {
    yoresel: "TRADITIONAL",
    spesiyaller: "SPECIALS",
    "tas-firin": "STONE OVEN & PIDE",
    "ara-sicak": "WARM STARTERS",
    tavuk: "CHICKEN VARIETIES",
    cocuk: "KIDS MENU",
    tatli: "DESSERTS",
    soguklar: "COLD MEZZE",
    icecekler: "BEVERAGES",
  },
  AR: {
    yoresel: "أطباق تقليدية",
    spesiyaller: "المميزات",
    "tas-firin": "فرن الحجر والفطائر",
    "ara-sicak": "المقبلات الساخنة",
    tavuk: "أطباق الدجاج",
    cocuk: "قائمة الأطفال",
    tatli: "حلويات",
    soguklar: "المقبلات الباردة",
    icecekler: "مشروبات",
  },
};`;

// Replace CATEGORIES
const catStart = page.indexOf("const CATEGORIES = [");
const catEnd = page.indexOf("];", catStart) + 2;
page = page.slice(0, catStart) + newCategories + page.slice(catEnd);

// Replace CATEGORY_NAMES
const catNamesStart = page.indexOf("const CATEGORY_NAMES: Record<Language, Record<string, string>> = {");
const catNamesEnd = page.indexOf("};", catNamesStart) + 2;
page = page.slice(0, catNamesStart) + newCatNames + page.slice(catNamesEnd);

// Replace DISHES
const dishesStart = page.indexOf("const DISHES: MenuItem[] = [");
const dishesEnd = page.indexOf("const FACADE_CENTER = ");
const dishesJson = `const DISHES: MenuItem[] = ${JSON.stringify(normalizedDishes, null, 2)};\n\n`;
page = page.slice(0, dishesStart) + dishesJson + page.slice(dishesEnd);

// 3. Step 3 UI Updates in page.tsx
// Replace table stage and dish presentation exactly as requested by user
const oldStageStart = page.indexOf("{/* MASİF CEVİZ MASAÜSTÜ ZEMİNİ & SICAK ORTAM IŞIĞI */");
const oldStageEnd = page.indexOf("{/* TABAK: DOĞAL MASAÜSTÜ VE AKICI GEÇİŞ (SLIDE/SPRING) */");

const userTableStage = `{/* Doğal Masif Ahşap Masa Dokusu & Üstten Vuran Sıcak Odak Lambası */}
              <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
                <div 
                  className="w-[900px] h-[500px] rounded-[100%] opacity-70"
                  style={{
                    background: "radial-gradient(ellipse at 50% 50%, #3d2314 0%, #20120a 50%, #0d0704 90%)",
                    filter: "blur(2px)"
                  }}
                />
                {/* Sıcak Masa Spot Işığı */}
                <div className="absolute w-[500px] h-[350px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
              </div>

              `;

if (oldStageStart !== -1 && oldStageEnd !== -1) {
  page = page.slice(0, oldStageStart) + userTableStage + page.slice(oldStageEnd);
  console.log("Replaced table stage with exact user spec!");
}

// Ensure luxury badges in left info panel match Step 3 format:
const oldBadgesStart = page.indexOf("{/* Profesyonel Lüks Rozetler: Kalori, Hazırlık Süresi, Alerjen */}");
let oldBadgesEnd = -1;
if (oldBadgesStart !== -1) {
  oldBadgesEnd = page.indexOf("</div>", oldBadgesStart) + 6;
}

const userBadges = `{/* Profesyonel Lüks Rozetler: Kalori, Hazırlık Süresi, Alerjen */}
              <div className="flex flex-wrap items-center gap-2 mt-4 font-mono text-[11px] select-none">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-300">
                  🔥 {activeDish.calories}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-300">
                  ⏱️ {activeDish.prepTime}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                  ⚠️ Alerjen: {Array.isArray(activeDish.allergens) ? activeDish.allergens.join(", ") : activeDish.allergens}
                </span>
              </div>`;

if (oldBadgesStart !== -1 && oldBadgesEnd !== -1) {
  page = page.slice(0, oldBadgesStart) + userBadges + page.slice(oldBadgesEnd);
  console.log("Updated left info badges to match Step 3 exact format!");
}

fs.writeFileSync("app/page.tsx", page);
console.log("Successfully updated app/page.tsx with the exact 65-dish catalog and Step 3 specs!");

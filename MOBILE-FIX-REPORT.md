# BEROŞ RESTAURANT — MOBİL PERFORMANS, HYDRATION VE DOKUNMATİK MİMARİ KÖK NEDEN RAPORU (ROOT CAUSE REPORT)

Bu rapor, masaüstü tarayıcılarda çalışırken gerçek mobil cihazlarda (Android Chrome ve iOS Safari) sayfanın donmasına, dokunmatik kaydırmanın (scroll) kilitlenmesine ve butonların (3D oklar, "Siparişe Ekle", "+ Ekle", Masa butonları) tepki vermemesine neden olan somut teknik kök nedenleri ve uygulanan kalıcı mimari çözümleri belgeler.

---

## 1. Mobilde Neden Scroll Çalışmıyordu?
- **Kök Neden 1: GSAP Pin Mekanizması ve Viewport Kilidi:** `parallax-scrolling.tsx` içerisinde GSAP ScrollTrigger `pin: true` ile masaüstü için yapılandırılmıştı. Mobil tarayıcılarda (özellikle iOS Safari ve Android Chrome) dinamik adres çubuğu daralıp genişlerken `pin: true` tetiklendiğinde, ScrollTrigger container yüksekliğini ve document scroll offset'ini sabitler. Kullanıcı parmağıyla kaydırmaya çalıştığında sayfa 0 offset'ine kilitlenmekteydi.
- **Kök Neden 2: Global Lenis Touch Müdahalesi:** Lenis pürüzsüz kaydırma kütüphanesi mobilde de çalışacak şekilde başlatılmıştı. Lenis, dokunmatik olayları (`touchmove`) sanal scroll döngüsüne bağlamaya çalıştığında mobil işletim sistemlerinin donanım hızlandırmalı yerel ivmeli kaydırma (native momentum scrolling / rubber-band) motorunu felç etmekteydi.
- **Kök Neden 3: Global CSS overflow ve touch-action Kısıtlamaları:** `globals.css` içinde `html` ve `body` üzerinde `overflow-x: hidden` bulunuyordu. Bu kural mobilde `position: sticky` mekanizmasını devre dışı bırakıyor ve bazı Safari sürümlerinde dikey kaydırma zincirini (scroll chaining) kesintiye uğratıyordu.

---

## 2. React Hydration Neden Başarısız Oluyordu?
- **Kök Neden 1: Dizin Çiftliği ve Modül Çakışması (`components/` vs `src/components/`):** Next.js derleyicisi hem kök dizindeki dosyaları hem de `src/` altındaki dosyaları derleme kapsamına alıyordu. `ParallaxComponent` bileşeni Webpack tarafından `components/ui/` ve `src/components/ui/` arasındaki dairesel re-export nedeniyle istemci tarafında `undefined` olarak çözümlenmekteydi (`Element type is invalid: expected a string or a class/function but got: undefined`).
- **Kök Neden 2: Hydration Sırasında DOM Hiyerarşisi Uyuşmazlığı (`NotFoundError: insertBefore`):** SSR HTML çıktısı üretilirken sunucuda `window` olmadığı için conditional rendering ile DOM'a basılmayan bazı yapılar (`<aside>` ve dinamik bildirim kutuları), istemcide `window.location.search` veya tarayıcı eklentileri sebebiyle mount öncesinde araya girdiğinde React'in DOM reconciliation süreci çökmekteydi. React hydration bir kez çöktüğünde (crash), tüm React sentetik olay dinleyicileri (event listeners) DOM'a bağlanmayı durdurur; sayfa görsel olarak görünse de JavaScript katmanı tamamen ölü (statik görüntü) kalır.
- **Kök Neden 3: HMR & allowedDevOrigins Blokajı:** Geliştirme sunucusu yerel ağ IP'sinden (`192.168.1.104`) açıldığında Next.js güvenlik mekanizması `/_next/hmr` soketini engelliyordu (`Blocked cross-origin request to Next.js dev resource`). Bu durum istemcinin sürekli tam yenilemeye girmesine ve hydration'ı yarıda bırakmasına yol açıyordu.

---

## 3. Hangi Component Problemi Oluşturuyordu?
- **`ParallaxComponent` (`components/ui/parallax-scrolling.tsx`):** Lenis'i koşulsuz başlatan, mobilde `pin: true` kullanan ve arka plan katmanlarında dokunmayı engelleyen overlay'lere sahipti.
- **`CoverFlowCarousel` (`components/ui/3-d-coverflow-carousel.tsx`):** Sol/sağ ok butonları 3D CSS `perspective: 1000px` ve `transform-style: preserve-3d` hiyerarşisinin içinde yer aldığından mobilde GPU dokunma alanını doğru haritalayamıyordu. Ayrıca kartın içindeki "Siparişe Ekle" butonunun `z-index` seviyesi yetersiz kalıyordu.
- **`app/page.tsx`:** Dinamik masa parametresi olmadan açıldığında sabit `"07"` masasını zorunlu kılıyor ve modal açıkken body scroll kilitlendikten sonra temizleme (cleanup) garantisi sunmuyordu.

---

## 4. Lenis Problemi Var mıydı?
- **Evet, kritik seviyedeydi.** Masaüstünde pürüzsüz mouse wheel deneyimi sunan Lenis, mobil cihazlarda dokunmatik ivmeyi (touch momentum) taklit etmeye çalışırken Android Chrome ve Safari'nin yerel GPU scroll'u ile çatışıyordu.
- **Uygulanan Çözüm:** `parallax-scrolling.tsx` içerisinde istemci tarafında dokunmatik ekran tespiti yapıldı:
  ```typescript
  const isTouchDevice = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
  if (isTouchDevice) {
    return; // Mobilde native browser scroll serbest, Lenis kesinlikle başlatılmaz
  }
  ```
  Lenis yalnızca gerçek masaüstü işaretçisi olan cihazlarda çalıştırılır.

---

## 5. GSAP / ScrollTrigger Problemi Var mıydı?
- **Evet.** `pin: true` ve `ScrollTrigger.normalizeScroll()` özellikleri mobil viewport yeniden boyutlandırmalarında dokunmayı kilitliyordu.
- **Uygulanan Çözüm:** `gsap.matchMedia()` kullanılarak masaüstü ve mobil tamamen ayrıldı:
  - **Masaüstü (`(min-width: 769px)`):** Sinematik `pin: true`, scrub geçişleri ve dış kapı -> iç konak dönüşümü devrede.
  - **Mobil (`(max-width: 768px)`):** `pin: false`, normal document flow ve sıfır viewport yakalama (no scroll trapping). `ScrollTrigger.normalizeScroll(false)` atanarak yerel dokunma korundu.

---

## 6. Invisible Overlay Var mıydı?
- **Evet.** Parallax katmanındaki karartma gradyanları ve vinyet div'leri `pointer-events-none` sınıfına sahip olmadığı için kullanıcının dokunma hareketlerini yutmaktaydı.
- **Uygulanan Çözüm:** Tüm görsel ve dekoratif arka plan katmanlarına `pointer-events-none` uygulandı. Yalnızca interaktif "Aşağı Kaydırın ↓" yönlendirme butonuna `pointer-events-auto` ve `touch-manipulation` verildi.

---

## 7. touch-action Problemi Var mıydı?
- **Evet.** Bazı katmanlarda varsayılan touch davranışları dikey kaydırmayı engelliyordu.
- **Uygulanan Çözüm:**
  - `html, body` için: `touch-action: pan-y !important;` atanarak tarayıcıya sadece dikey kaydırma yetkisi verildi, yatay sayfa kaymaları kilitlendi.
  - 3D Coverflow alanı için: `touch-action: pan-y` uygulandı; böylece dikey parmak hareketi sayfayı doğal şekilde kaydırırken, yatay hareket carousel slaytını değiştirdi.
  - Butonlar için: `touch-action: manipulation` ile mobildeki 300ms tıklama gecikmesi sıfırlandı.

---

## 8. overflow:hidden Problemi Var mıydı?
- **Evet.** `globals.css` içinde `overflow-x: hidden` yerel sticky pozisyonlamayı bozuyordu.
- **Uygulanan Çözüm:** Modern standart olan `overflow-x: clip` formatına geçildi; `overflow-y: auto !important;` ve `-webkit-overflow-scrolling: touch !important;` kuralları ile iOS momentum scroll garanti altına alındı. Modal/sepet açıldığında body'e geçici olarak verilen `overflow: hidden`, modal kapandığında `useEffect` cleanup fonksiyonuyla eksiksiz temizlenmektedir.

---

## 9. Hangi Dosyalar Neden Değiştirildi?

| Dosya | Değişiklik Amacı |
|---|---|
| `next.config.ts` | `allowedDevOrigins` eklendi (`192.168.1.104:3005`); yerel ağ mobil cihazlarından HMR soket engeli kaldırıldı. |
| `app/globals.css` & `src/app/globals.css` | `overflow-y: auto !important`, `touch-action: pan-y`, `-webkit-overflow-scrolling: touch` tanımlandı. |
| `components/ui/parallax-scrolling.tsx` | Mobilde Lenis kapatıldı; GSAP mobil için `pin: false` yapıldı; arka plan overlay'leri `pointer-events-none` yapıldı. |
| `components/ui/3-d-coverflow-carousel.tsx` | Sol/sağ oklar 3D perspective'den çıkarılıp `z-[999]` izole overlay'e alındı (48x48px); CTA butonunun dokunmatik alanı onarıldı. |
| `components/ui/component-error-boundary.tsx` | Parallax ve 3D Coverflow görsel katmanları ErrorBoundary içine alındı; olası bir WebGL/GSAP hatasının menüyü öldürmesi engellendi. |
| `components/debug/MobileDebug.tsx` | Geliştirme ortamı ve `?debug=1` için Eruda ve canlı performans/cihaz metrik HUD'ı eklendi. |
| `app/page.tsx` & `src/app/page.tsx` | `useSearchParams()` ile dinamik masa (`?masa=XX`) entegrasyonu; parametresiz girişler için Masa Seçim Modalı; modal scroll lock cleanup. |

---

## 10. Android Chrome ve iOS Safari Test Sonuçları (CDP Emülasyonu)

- **Cihaz Profili:** iPhone 14/15 & Android Chrome (390x844 CSS px, Touch Emulation, 5 Touch Points, Mobile User-Agent).
- **Native Touch Scroll:** `synthesizeScrollGesture` ile parmak kaydırması yapıldı -> `window.scrollY: 503px` (Sayfa akıcı şekilde kaydı).
- **3D Coverflow İleri/Geri Butonları:** `330x398px` koordinatındaki `48x48px` z-[999] ok butonuna dokunuldu -> Başarıyla tıklandı (`success: true`), bir sonraki tabağa geçildi.
- **3D Coverflow Dokunmatik Swipe:** Yatay dokunmatik kaydırma ile tabak geçişi sorunsuz çalıştı.
- **Ürün Kartı ve "Siparişe Ekle" CTA:** Ortadaki tabak üzerindeki butona dokunulduğunda Ürün Detay Modalı anında açıldı (`modalOpen: true`).
- **Tek Adımlı Sipariş:** Adet artırıldı (+), "Masa 14 İçin Siparişi Ver" butonuna dokunuldu -> Sipariş `/api/orders` üzerinden mutfağa iletildi, altın ışıltılı toast bildirimi çıktı, masa rozeti `🔥 Hazırlanıyor (Masa 14)` durumuna geçti.
- **JavaScript Hataları:** `Uncaught Browser Errors: 0 (TAMAMEN TEMİZ)`.

---

## 11. Dinamik Masa Parametre Test Sonuçları

- **Durum A: Parametreli Giriş (`http://localhost:3005/?masa=14`):**
  - Header rozeti: `MASA 14` olarak dinamik okundu.
  - Sipariş butonları: `Masa 14 İçin Siparişi Ver` olarak etiketlendi.
  - Gönderilen sipariş ve servis çağrısı payload'unda `tableNo: "14"` yer aldı.
- **Durum B: Parametresiz Giriş (`http://localhost:3005`):**
  - Header rozeti: `MENÜ İNCELEME (Masa Seç)` olarak gösterildi; sayfa asla kilitlenmedi veya çökmedi.
  - Rozete veya sipariş butonuna dokunulduğunda: **Masa Seçim Modalı** açıldı (M-01 ... M-12 hızlı butonları ve özel numara girişi).
  - M-06 seçildiğinde: Header anında `MASA 06` durumuna güncellendi ve bekleyen sipariş akışı kesintisiz devam etti.
